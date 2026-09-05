import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';

export async function GET() {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ authenticated: false, customer: null }, { status: 401 });
        }

        // Get wishlist IDs
        const wishlistItems = await prisma.wishlistItem.findMany({
            where: { customerId: customer.id },
            select: { productId: true },
        });

        const wishlistIds = wishlistItems.map((item) => item.productId);

        // Get order count
        const ordersCount = await prisma.order.count({
            where: { customerId: customer.id },
        });

        return NextResponse.json({
            authenticated: true,
            customer,
            wishlistIds,
            ordersCount,
        });
    } catch (error) {
        console.error('Customer me error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { shopName, ownerName, city, address, notes } = body;

        const updated = await prisma.customer.update({
            where: { id: customer.id },
            data: {
                shopName: shopName?.trim() || customer.shopName,
                ownerName: ownerName?.trim() || customer.ownerName,
                city: city?.trim() || customer.city,
                address: address?.trim() || customer.address,
                notes: notes !== undefined ? notes?.trim() : customer.notes,
            },
            select: {
                id: true,
                shopName: true,
                ownerName: true,
                phone: true,
                city: true,
                address: true,
                notes: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            customer: updated,
            message: 'تم تحديث بيانات المحل بنجاح!',
        });
    } catch (error: any) {
        console.error('Customer profile update error:', error);
        return NextResponse.json({ error: error?.message || 'فشل التحديث' }, { status: 500 });
    }
}
