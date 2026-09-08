import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';
import { projectProductsPrices } from '@/lib/price-visibility';

export async function GET() {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'غير مصرح', products: [], wishlistIds: [] }, { status: 401 });
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

        const canViewPrices = Boolean(customer?.isActive);
        const products = projectProductsPrices(
            items.map((item) => item.product),
            canViewPrices
        );
        return NextResponse.json({
            success: true,
            products,
            wishlistIds: items.map((item) => item.productId),
        });
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

        const body = await req.json().catch(() => ({}));
        const { action, productId, productIds } = body;

        // Action: MERGE guest wishlist into authenticated customer wishlist
        if (action === 'merge') {
            const rawIds: unknown[] = Array.isArray(productIds)
                ? productIds
                : typeof productId === 'string'
                ? [productId]
                : [];
            const idsToMerge = Array.from(
                new Set(
                    rawIds
                        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
                        .map((id) => id.trim())
                )
            );

            if (idsToMerge.length > 0) {
                // Verify products exist to prevent foreign key constraint violations
                const existingProducts = await prisma.product.findMany({
                    where: { id: { in: idsToMerge } },
                    select: { id: true },
                });
                const validProductIds = existingProducts.map((p) => p.id);

                if (validProductIds.length > 0) {
                    await prisma.wishlistItem.createMany({
                        data: validProductIds.map((pid) => ({
                            customerId: customer.id,
                            productId: pid,
                        })),
                        skipDuplicates: true,
                    });
                }
            }

            const currentItems = await prisma.wishlistItem.findMany({
                where: { customerId: customer.id },
                select: { productId: true },
            });
            const mergedWishlistIds = currentItems.map((item) => item.productId);

            return NextResponse.json({
                success: true,
                action: 'merged',
                wishlistIds: mergedWishlistIds,
            });
        }

        // Action: REMOVE from wishlist
        if (action === 'remove') {
            if (!productId || typeof productId !== 'string') {
                return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
            }

            await prisma.wishlistItem.deleteMany({
                where: {
                    customerId: customer.id,
                    productId: productId.trim(),
                },
            });

            return NextResponse.json({ success: true, action: 'removed', productId: productId.trim() });
        }

        // Action: ADD to wishlist (or default idempotent add when action is 'add' or omitted)
        if (action === 'add' || (!action && productId)) {
            if (!productId || typeof productId !== 'string') {
                return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
            }

            const trimmedId = productId.trim();
            const productExists = await prisma.product.findUnique({
                where: { id: trimmedId },
                select: { id: true },
            });

            if (!productExists) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            await prisma.wishlistItem.upsert({
                where: {
                    customerId_productId: {
                        customerId: customer.id,
                        productId: trimmedId,
                    },
                },
                create: {
                    customerId: customer.id,
                    productId: trimmedId,
                },
                update: {},
            });

            return NextResponse.json({ success: true, action: 'added', productId: trimmedId });
        }

        return NextResponse.json({ error: 'Invalid action or missing productId' }, { status: 400 });
    } catch (error) {
        console.error('Customer wishlist POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول لحفظ المنتجات بالمفضلة.' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let productId = searchParams.get('productId');
        if (!productId) {
            const body = await req.json().catch(() => ({}));
            productId = body?.productId;
        }

        if (!productId || typeof productId !== 'string') {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        await prisma.wishlistItem.deleteMany({
            where: {
                customerId: customer.id,
                productId: productId.trim(),
            },
        });

        return NextResponse.json({ success: true, action: 'removed', productId: productId.trim() });
    } catch (error) {
        console.error('Customer wishlist DELETE error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
