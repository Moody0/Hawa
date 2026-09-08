import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';
import { projectOrdersPrices } from '@/lib/price-visibility';

export async function GET() {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: {
                customerId: customer.id,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                nameAr: true,
                                nameEn: true,
                                slug: true,
                                images: true,
                                price: true,
                                discountPrice: true,
                                packaging: true,
                                itemsPerPackage: true,
                                hidePrice: true,
                                brand: {
                                    select: {
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const canViewPrices = Boolean(customer?.isActive);
        const safeOrders = projectOrdersPrices(orders, canViewPrices);
        return NextResponse.json({ success: true, orders: safeOrders });
    } catch (error) {
        console.error('Customer orders error:', error);
        return NextResponse.json({ error: 'فشل جلب الطلبات' }, { status: 500 });
    }
}
