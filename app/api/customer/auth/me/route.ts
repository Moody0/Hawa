import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';
import { validateCustomerProfileUpdate } from '@/lib/customer-validation';

export async function GET(req: Request) {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ authenticated: false, customer: null }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const includeWishlist = searchParams.get('includeWishlist') === 'true';
        const includeOrders = searchParams.get('includeOrders') === 'true';

        let wishlistIds: string[] = [];
        if (includeWishlist) {
            const wishlistItems = await prisma.wishlistItem.findMany({
                where: { customerId: customer.id },
                select: { productId: true },
            });
            wishlistIds = wishlistItems.map((item) => item.productId);
        }

        let ordersCount: number | undefined;
        if (includeOrders) {
            ordersCount = await prisma.order.count({
                where: { customerId: customer.id },
            });
        }

        return NextResponse.json({
            authenticated: true,
            customer,
            ...(includeWishlist ? { wishlistIds } : {}),
            ...(ordersCount !== undefined ? { ordersCount } : {}),
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

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: 'صيغة البيانات غير صحيحة (JSON غير صالح)', errors: { _general: 'JSON غير صالح' } },
                { status: 400 }
            );
        }

        const validation = validateCustomerProfileUpdate(body);
        if (!validation.isValid || !validation.cleanData) {
            const primaryError = Object.values(validation.errors)[0] || 'بيانات غير صالحة';
            return NextResponse.json(
                { error: primaryError, errors: validation.errors },
                { status: 422 }
            );
        }

        const { shopName, ownerName, city, address, notes } = validation.cleanData;

        const updated = await prisma.customer.update({
            where: { id: customer.id },
            data: {
                ...(shopName !== undefined ? { shopName } : {}),
                ...(ownerName !== undefined ? { ownerName } : {}),
                ...(city !== undefined ? { city } : {}),
                ...(address !== undefined ? { address } : {}),
                ...(notes !== undefined ? { notes } : {}),
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
