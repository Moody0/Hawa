import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedCustomer, sanitizeString, normalizeSyrianPhone } from "@/lib/customer-auth";
import { validateOrderForm } from "@/lib/order-validation";
import { validateAndAggregateOrderLines, computeOrderRequestHash } from "@/lib/order-lines";
import { cookies } from "next/headers";
import { signOrderAccessToken, GUEST_ORDER_SESSION_COOKIE, addOrderToGuestSession } from "@/lib/order-token";
import { Prisma } from "@prisma/client";
import { CONTACT_CONFIG } from "@/lib/site-config";
import { 
    getClientIp, 
    checkRateLimit, 
    checkRequestBodyLimit, 
    recordSecurityMetric 
} from "@/lib/rate-limit";
import { recordErrorEvent } from "@/lib/monitoring";

async function safelySetGuestSessionCookie(response: NextResponse, orderId: string, orderToken: string) {
    try {
        const cookieStore = await cookies();
        const currentGuestCookie = cookieStore.get(GUEST_ORDER_SESSION_COOKIE)?.value;
        const updatedGuestSession = addOrderToGuestSession(currentGuestCookie, orderId, orderToken);

        response.cookies.set(GUEST_ORDER_SESSION_COOKIE, updatedGuestSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });
    } catch {
        response.cookies.set(`order_access_${orderId}`, orderToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });
    }
}

export async function POST(request: Request) {
    const ip = getClientIp(request);

    // Enforce request body size limit (200KB)
    if (!checkRequestBodyLimit(request, 200 * 1024)) {
        recordSecurityMetric({ action: 'order_submission', ip, status: 'blocked', reason: 'payload_too_large' });
        return NextResponse.json(
            { message: "حجم الطلب كبير جداً" },
            { status: 413 }
        );
    }

    // IP-level burst limit: max 10 orders per 10 minutes per IP
    const burstLimit = checkRateLimit(`order:ip:${ip}`, 10, 10 * 60 * 1000);
    if (!burstLimit.allowed) {
        recordSecurityMetric({ action: 'order_submission', ip, status: 'blocked', reason: 'burst_limit_exceeded' });
        return NextResponse.json(
            { message: `تم تجاوز حد إرسال الطلبات مؤقتاً. يرجى الانتظار ${burstLimit.retryAfterSeconds} ثانية.` },
            { 
                status: 429,
                headers: { 'Retry-After': String(burstLimit.retryAfterSeconds) }
            }
        );
    }

    try {
        const body = await request.json().catch(() => ({}));

        // 1. Authenticate user if customer session is present
        let authenticatedCustomer = null;
        try {
            authenticatedCustomer = await getAuthenticatedCustomer();
        } catch {
            authenticatedCustomer = null;
        }

        // 2. Validate and sanitize form fields
        const rawShopName = sanitizeString(body.shopName || authenticatedCustomer?.shopName || '', 100);
        const rawOwnerName = sanitizeString(body.ownerName || (body.firstName ? `${body.firstName} ${body.lastName || ''}` : '') || authenticatedCustomer?.ownerName || '', 100);
        const rawPhone = normalizeSyrianPhone(body.phone || authenticatedCustomer?.phone || '');
        const rawCity = sanitizeString(body.city || authenticatedCustomer?.city || '', 50);
        const rawAddress = sanitizeString(body.streetAddress || body.address || authenticatedCustomer?.address || '', 250);
        const rawNotes = body.notes ? sanitizeString(body.notes, 500) : null;

        const validation = validateOrderForm({
            shopName: rawShopName,
            ownerName: rawOwnerName,
            phone: rawPhone,
            city: rawCity,
            streetAddress: rawAddress,
            notes: rawNotes || undefined,
        });

        if (!validation.isValid) {
            const firstErrorKey = Object.keys(validation.errors)[0] as keyof typeof validation.errors;
            const errorMsg = validation.errors[firstErrorKey] || "بيانات الطلب غير مكتملة أو غير صالحة";
            return NextResponse.json(
                { success: false, error: "VALIDATION_ERROR", message: errorMsg, errors: validation.errors },
                { status: 400 }
            );
        }

        const { cleanData } = validation;

        // 3. Aggregate and validate order lines (Phase 3.2)
        const lineValidation = validateAndAggregateOrderLines(body.items);
        if (!lineValidation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "VALIDATION_ERROR",
                    message: lineValidation.error,
                    details: lineValidation.details,
                },
                { status: 400 }
            );
        }

        const aggregatedItems = lineValidation.mergedItems;

        // 4. Determine and validate Idempotency Key (Phase 3.5)
        const headerKey = request.headers.get("x-idempotency-key") || request.headers.get("idempotency-key");
        const bodyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : null;
        const idempotencyKey = (headerKey || bodyKey || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`).trim();

        // Compute deterministic request hash
        const requestHash = computeOrderRequestHash({
            shopName: cleanData.shopName,
            phone: cleanData.phone,
            city: cleanData.city,
            streetAddress: cleanData.streetAddress,
            items: aggregatedItems,
        });

        // Retrieve configured WhatsApp number
        const settings = await prisma.settings.findUnique({
            where: { id: "site-settings" },
            select: { whatsappNumber: true },
        });
        const whatsappNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || CONTACT_CONFIG.salesWhatsApp;

        // Check if an order with this idempotency key already exists
        const existingOrder = await prisma.order.findUnique({
            where: { idempotencyKey },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                nameAr: true,
                                nameEn: true,
                                images: true,
                                packaging: true,
                                itemsPerPackage: true,
                            },
                        },
                    },
                },
            },
        });

        if (existingOrder) {
            // Verify payload matches the original submission
            if (existingOrder.requestHash && existingOrder.requestHash !== requestHash) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "IDEMPOTENCY_CONFLICT",
                        message: "مفتاح العملية مستخدم لطلب مختلف. يرجى تجديد السلة وإعادة المحاولة.",
                    },
                    { status: 422 }
                );
            }

            // Return original order without duplicate deduction (Phase 3.5 replay)
            const orderToken = signOrderAccessToken(existingOrder.id);
            const responseOrder = authenticatedCustomer
                ? existingOrder
                : {
                    ...existingOrder,
                    totalAmount: 0,
                    items: existingOrder.items.map((item) => ({ ...item, price: 0 })),
                };

            const response = NextResponse.json(
                { ...responseOrder, whatsappNumber, orderToken, isReplay: true },
                { status: 200 }
            );
            await safelySetGuestSessionCookie(response, existingOrder.id, orderToken);
            return response;
        }

        // 5. Execute Atomic Stock Reservation & Order Creation (Phase 3.3)
        const order = await prisma.$transaction(async (tx) => {
            const productIds = aggregatedItems.map((item) => item.productId);

            const dbProducts = await tx.product.findMany({
                where: { id: { in: productIds } },
                select: {
                    id: true,
                    name: true,
                    nameAr: true,
                    price: true,
                    discountPrice: true,
                    stock: true,
                    minOrder: true,
                    packaging: true,
                },
            });

            const productMap = new Map(dbProducts.map((p) => [p.id, p]));

            // Verify all products exist and satisfy minOrder requirements
            for (const item of aggregatedItems) {
                const dbProduct = productMap.get(item.productId);
                if (!dbProduct) {
                    throw new Error(`المنتج المطلوب غير متوفر أو تم حذفه (${item.productId})`);
                }

                const minQty = Math.max(1, dbProduct.minOrder || 1);
                if (item.quantity < minQty) {
                    throw new Error(`الحد الأدنى للطلب من "${dbProduct.nameAr || dbProduct.name}" هو ${minQty} طرد`);
                }
            }

            // ATOMIC CONDITIONAL UPDATE:
            // updateMany with { stock: { gte: item.quantity } } requires affected count to be exactly 1.
            // If any item fails, it throws and aborts the entire transaction atomically.
            for (const item of aggregatedItems) {
                const dbProduct = productMap.get(item.productId)!;

                const updateResult = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                if (updateResult.count !== 1) {
                    throw new Error(
                        `الكمية المطلوبة من "${dbProduct.nameAr || dbProduct.name}" غير متوفرة حالياً في المستودع.`
                    );
                }
            }

            // Calculate subtotal safely (temporary zero prices are supported and not rejected)
            let serverSubtotal = 0;
            const sanitizedOrderItems = aggregatedItems.map((item) => {
                const dbProduct = productMap.get(item.productId)!;
                const itemUnitPrice = Math.max(0, Number(dbProduct.discountPrice ?? dbProduct.price ?? 0));
                serverSubtotal += itemUnitPrice * item.quantity;

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: itemUnitPrice,
                    options: item.options,
                };
            });

            const serverTotalAmount = parseFloat(serverSubtotal.toFixed(2));

            // Determine effective customer ID
            // Task 4.3: Attach a new order to a customer only when that customer is authenticated
            const effectiveCustomerId: string | null = authenticatedCustomer ? authenticatedCustomer.id : null;

            // Create Order with stock reservation marker and idempotency details
            const newOrder = await tx.order.create({
                data: {
                    shopName: cleanData.shopName,
                    Name: cleanData.ownerName,
                    phone: cleanData.phone,
                    streetAddress: cleanData.streetAddress,
                    city: cleanData.city,
                    notes: cleanData.notes || null,
                    totalAmount: serverTotalAmount,
                    status: "PENDING",
                    customerId: effectiveCustomerId,
                    discount: 0,
                    stockReserved: true,
                    idempotencyKey,
                    requestHash,
                    items: {
                        create: sanitizedOrderItems,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    nameAr: true,
                                    nameEn: true,
                                    images: true,
                                    packaging: true,
                                    itemsPerPackage: true,
                                },
                            },
                        },
                    },
                },
            });

            // Record auditable inventory movements for each reserved line
            for (const item of aggregatedItems) {
                await tx.inventoryMovement.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: -item.quantity, // negative denotes reservation
                        type: "RESERVATION",
                        reason: `حجز كمية للطلب رقم ${newOrder.id}`,
                    },
                });
            }

            return newOrder;
        }, {
            maxWait: 20000,
            timeout: 30000,
        });

        const orderToken = signOrderAccessToken(order.id);
        const responseOrder = authenticatedCustomer
            ? order
            : {
                ...order,
                totalAmount: 0,
                items: order.items.map((item) => ({ ...item, price: 0 })),
            };

        const response = NextResponse.json({ ...responseOrder, whatsappNumber, orderToken }, { status: 201 });
        await safelySetGuestSessionCookie(response, order.id, orderToken);

        return response;
    } catch (error: any) {
        // Handle concurrent race collision on unique idempotencyKey
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const target = (error.meta?.target as string[]) || [];
            if (target.includes("idempotencyKey")) {
                const replay = await prisma.order.findFirst({
                    where: {
                        OR: [
                            { idempotencyKey: (error.meta as any)?.idempotencyKey },
                        ],
                    },
                    include: { items: true },
                });
                if (replay) {
                    const token = signOrderAccessToken(replay.id);
                    return NextResponse.json({ ...replay, orderToken: token, isReplay: true }, { status: 200 });
                }
            }
        }

        console.error("Order creation error:", error);
        const errMsg = String(error?.message || "");
        const isStockConflict = errMsg.includes("غير متوفرة") || errMsg.toLowerCase().includes("stock");
        recordErrorEvent({
            category: isStockConflict ? "stock_conflict" : "order_failure",
            route: "/api/orders",
            message: errMsg || "Order submission failed",
            status: 422,
        });

        return NextResponse.json(
            {
                success: false,
                error: "ORDER_FAILED",
                message: error?.message || "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى",
            },
            { status: 422 }
        );
    }
}
