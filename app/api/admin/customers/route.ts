import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(req: Request) {
    try {
        await requireAdminSession();
    } catch {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    try {

        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get('cursor');
        const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 100);
        const search = searchParams.get('search')?.trim();
        const activeOnly = searchParams.get('active');

        const where: Record<string, any> = {};
        if (activeOnly === 'true') where.isActive = true;
        if (activeOnly === 'false') where.isActive = false;
        if (search) {
            where.OR = [
                { shopName: { contains: search, mode: 'insensitive' } },
                { ownerName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                take: limit + 1,
                skip: cursor ? 1 : 0,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: [
                    { createdAt: 'desc' },
                    { id: 'desc' }
                ],
                include: {
                    _count: {
                        select: {
                            orders: true,
                            wishlist: true,
                        },
                    },
                },
            }),
            prisma.customer.count({ where })
        ]);

        const hasMore = customers.length > limit;
        const pageCustomers = hasMore ? customers.slice(0, limit) : customers;
        const nextCursor = hasMore ? pageCustomers[pageCustomers.length - 1].id : null;

        // Group totalSpent directly in the database for the active customer page
        const customerIds = pageCustomers.map(c => c.id);
        const orderSpentGroups = customerIds.length > 0
            ? await prisma.order.groupBy({
                by: ['customerId'],
                where: {
                    customerId: { in: customerIds },
                    status: { not: 'CANCELLED' }
                },
                _sum: { totalAmount: true }
            })
            : [];
        const spentMap = new Map(orderSpentGroups.map(g => [g.customerId, Number(g._sum.totalAmount || 0)]));

        const formatted = pageCustomers.map((c) => ({
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
            totalSpent: spentMap.get(c.id) || 0,
        }));

        return NextResponse.json({
            success: true,
            customers: formatted,
            pagination: {
                total,
                hasMore,
                nextCursor,
                limit
            }
        });
    } catch (error) {
        console.error('Admin customers GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await requireAdminSession();
    } catch {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    try {
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
        await requireAdminSession();
    } catch {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    try {
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
