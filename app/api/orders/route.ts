import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface OrderItemInput {
    productId: string;
    quantity: number;
    price: number;
    options?: string | null;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            shopName,
            ownerName,
            firstName,
            lastName,
            phone,
            streetAddress,
            city,
            notes,
            totalAmount,
            promoCodeId,
            discount,
            items,
            customerId
        } = body;

        // Customer / Owner name fallback
        const customerName = ownerName || (firstName ? `${firstName} ${lastName || ''}`.trim() : (shopName || 'عميل محترم'));

        // Basic validation: phone, city, address, items, and at least shopName or customerName
        if (!phone || !streetAddress || !city || !items || items.length === 0 || (!shopName && !customerName)) {
            return NextResponse.json(
                { message: "Missing required fields: please provide shop name, phone, city, and address" },
                { status: 400 }
            );
        }

        // Create order with items in a transaction
        const order = await prisma.$transaction(async (tx) => {
            let effectiveCustomerId = customerId || null;
            if (!effectiveCustomerId) {
                const cleanPhone = phone.replace(/[^0-9]/g, '');
                const found = await tx.customer.findUnique({ where: { phone: cleanPhone } });
                if (found) effectiveCustomerId = found.id;
            }

            const newOrder = await tx.order.create({
                data: {
                    shopName: shopName || null,
                    Name: customerName,
                    phone,
                    streetAddress,
                    city,
                    notes: notes || null,
                    totalAmount,
                    status: 'PENDING',
                    promoCodeId: promoCodeId || null,
                    customerId: effectiveCustomerId,
                    discount: discount || 0,
                    items: {
                        create: items.map((item: OrderItemInput) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            options: item.options || null,
                        }))
                    }
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            // Update Promo Code stats
            if (promoCodeId) {
                await tx.promoCode.update({
                    where: { id: promoCodeId },
                    data: {
                        usageCount: { increment: 1 },
                        totalSales: { increment: totalAmount }
                    }
                });
            }

            return newOrder;
        });

        // Retrieve configured WhatsApp number
        const settings = await prisma.settings.findUnique({
            where: { id: "site-settings" },
            select: { whatsappNumber: true }
        });
        const whatsappNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+963900000000";

        return NextResponse.json({ ...order, whatsappNumber }, { status: 201 });
    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
