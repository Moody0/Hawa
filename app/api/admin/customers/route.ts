import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const customers = await prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        orders: true,
                        wishlist: true,
                    },
                },
                orders: {
                    select: {
                        totalAmount: true,
                    },
                },
            },
        });

        const formatted = customers.map((c) => {
            const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
            return {
                id: c.id,
                shopName: c.shopName,
                ownerName: c.ownerName,
                phone: c.phone,
                city: c.city,
                address: c.address,
                notes: c.notes,
                isActive: c.isActive,
                createdAt: c.createdAt,
                ordersCount: c._count.orders,
                wishlistCount: c._count.wishlist,
                totalSpent,
            };
        });

        return NextResponse.json({ success: true, customers: formatted });
    } catch (error) {
        console.error('Admin customers GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { id, isActive } = body;

        const updated = await prisma.customer.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json({ success: true, customer: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.customer.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete' }, { status: 500 });
    }
}
