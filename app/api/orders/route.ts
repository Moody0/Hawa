import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedCustomer, sanitizeString, normalizeSyrianPhone } from "@/lib/customer-auth";
import { validateOrderForm } from "@/lib/order-validation";
import { signOrderAccessToken } from "@/lib/order-token";

interface IncomingOrderItem {
    productId: string;
    quantity: number;
    price?: number;
    options?: string | null;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Authenticate user if customer session is present
        const authenticatedCustomer = await getAuthenticatedCustomer();

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
            return NextResponse.json({ message: errorMsg, errors: validation.errors }, { status: 400 });
        }

        const { cleanData } = validation;

        // 3. Validate Cart Items Array
        const incomingItems: IncomingOrderItem[] = body.items;
        if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
            return NextResponse.json(
                { message: "سلة المشتريات فارغة، يرجى إضافة منتجات للمتابعة" },
                { status: 400 }
            );
        }

        if (incomingItems.length > 100) {
            return NextResponse.json(
                { message: "تجاوزت الحد الأقصى المسموح به لعدد العناصر في الطلبية الواحدة" },
                { status: 400 }
            );
        }

        // 4. Validate and verify each item with database in a secure transaction
        const order = await prisma.$transaction(async (tx) => {
            // Collect unique product IDs
            const productIds = Array.from(
                new Set(
                    incomingItems
                        .map((item) => (typeof item.productId === 'string' ? item.productId.trim() : ''))
                        .filter(Boolean)
                )
            );

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
                    hidePrice: true,
                    packaging: true,
                },
            });

            const productMap = new Map(dbProducts.map((p) => [p.id, p]));

            // Verify all products exist
            for (const item of incomingItems) {
                const dbProduct = productMap.get(item.productId);
                if (!dbProduct) {
                    throw new Error(`المنتج المطلوب غير متوفر أو تم حذفه (${item.productId})`);
                }
            }

            // Securely calculate prices, enforce stock, and build sanitized items
            let serverSubtotal = 0;
            const sanitizedOrderItems = incomingItems.map((item) => {
                const dbProduct = productMap.get(item.productId)!;

                // Validate quantity
                const rawQty = Number(item.quantity);
                const minQty = Math.max(1, dbProduct.minOrder || 1);
                const safeQty = Number.isInteger(rawQty) && rawQty >= 1 ? Math.min(rawQty, 10000) : minQty;

                if (safeQty < minQty) {
                    throw new Error(`الحد الأدنى للطلب من ${dbProduct.nameAr || dbProduct.name} هو ${minQty}`);
                }

                // Security Check: Block guest checkout on wholesale hidden-price items
                if (dbProduct.hidePrice && !authenticatedCustomer) {
                    throw new Error(
                        `المنتج "${dbProduct.nameAr || dbProduct.name}" مخصص لتجار الجملة المعتمدين فقط. يرجى تسجيل الدخول بحسابك التجاري لمتابعة الطلب.`
                    );
                }

                // Real-time stock availability check
                if (dbProduct.stock < safeQty) {
                    throw new Error(
                        `الكمية المطلوبة من "${dbProduct.nameAr || dbProduct.name}" (${safeQty}) تتجاوز الكمية المتوفرة حالياً بالمستودع (${dbProduct.stock} قطعة).`
                    );
                }

                // Determine unit price securely on server (never trust client-supplied price)
                const itemUnitPrice = Number(dbProduct.discountPrice ?? dbProduct.price);
                if (itemUnitPrice <= 0) {
                    throw new Error(`تعذر تحديد سعر صحيح للمنتج "${dbProduct.nameAr || dbProduct.name}".`);
                }

                const lineTotal = itemUnitPrice * safeQty;
                serverSubtotal += lineTotal;

                return {
                    productId: dbProduct.id,
                    quantity: safeQty,
                    price: itemUnitPrice,
                    options: item.options ? sanitizeString(item.options, 100) : null,
                };
            });

            const serverTotalAmount = parseFloat(serverSubtotal.toFixed(2));

            // Determine effective customer ID (prevent identity spoofing)
            let effectiveCustomerId: string | null = null;
            if (authenticatedCustomer) {
                effectiveCustomerId = authenticatedCustomer.id;
            } else {
                const found = await tx.customer.findUnique({
                    where: { phone: cleanData.phone },
                    select: { id: true },
                });
                if (found) effectiveCustomerId = found.id;
            }

            // Atomically decrement stock for all ordered items
            for (const item of sanitizedOrderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    shopName: cleanData.shopName,
                    Name: cleanData.ownerName,
                    phone: cleanData.phone,
                    streetAddress: cleanData.streetAddress,
                    city: cleanData.city,
                    notes: cleanData.notes || null,
                    totalAmount: serverTotalAmount,
                    status: 'PENDING',
                    customerId: effectiveCustomerId,
                    discount: 0,
                    items: {
                        create: sanitizedOrderItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            options: item.options,
                        })),
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

            return newOrder;
        });

        // Retrieve configured WhatsApp number
        const settings = await prisma.settings.findUnique({
            where: { id: "site-settings" },
            select: { whatsappNumber: true },
        });
        const whatsappNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+963900000000";

        const orderToken = signOrderAccessToken(order.id);
        const response = NextResponse.json({ ...order, whatsappNumber, orderToken }, { status: 201 });
        response.cookies.set(`order_access_${order.id}`, orderToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { message: error?.message || "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى" },
            { status: 400 }
        );
    }
}
