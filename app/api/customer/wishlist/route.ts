import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';

export async function GET() {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ wishlist: [] });
        }

        const items = await prisma.wishlistItem.findMany({
            where: { customerId: customer.id },
            include: {
                product: {
                    include: {
                        brand: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const products = items.map((item) => item.product);
        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Customer wishlist GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول لحفظ المنتجات بالمفضلة.' }, { status: 401 });
        }

        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const existing = await prisma.wishlistItem.findUnique({
            where: {
                customerId_productId: {
                    customerId: customer.id,
                    productId,
                },
            },
        });

        if (existing) {
            // Remove
            await prisma.wishlistItem.delete({
                where: { id: existing.id },
            });
            return NextResponse.json({ success: true, action: 'removed', productId });
        } else {
            // Add
            await prisma.wishlistItem.create({
                data: {
                    customerId: customer.id,
                    productId,
                },
            });
            return NextResponse.json({ success: true, action: 'added', productId });
        }
    } catch (error) {
        console.error('Customer wishlist POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
