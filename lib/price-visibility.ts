import { getAuthenticatedCustomer } from '@/lib/customer-auth';
import { getValidAdminSession } from '@/lib/admin-auth';
import { cookies } from 'next/headers';

/**
 * Checks whether the current request context is authorized to view wholesale prices.
 * Only authenticated, active, approved merchants or authenticated admins are permitted.
 * Includes fast cookie guard to prevent unnecessary database roundtrips for guests.
 */
export async function canViewWholesalePrices(): Promise<boolean> {
    try {
        let cookieStore;
        try {
            cookieStore = await cookies();
        } catch {
            return false;
        }

        const hasMerchantCookie = cookieStore.has('hawa_merchant_session');
        const hasAdminCookie = 
            cookieStore.has('next-auth.session-token') || 
            cookieStore.has('__Secure-next-auth.session-token');

        if (!hasMerchantCookie && !hasAdminCookie) {
            return false;
        }

        if (hasMerchantCookie) {
            const customer = await getAuthenticatedCustomer();
            if (customer && customer.isActive) {
                return true;
            }
        }

        if (hasAdminCookie) {
            const adminUser = await getValidAdminSession().catch(() => null);
            if (adminUser) {
                return true;
            }
        }

        return false;
    } catch {
        return false;
    }
}

export type ProjectedProduct<T> = Omit<T, 'price' | 'discountPrice' | 'discountType' | 'discountValue'> & {
    price: string | number | null;
    discountPrice: string | number | null;
    discountType: string | null;
    discountValue: string | number | null;
};

/**
 * Redacts wholesale pricing information for guests/unauthorized users.
 */
export function projectProductPrices<T extends Record<string, any>>(
    product: T,
    canViewPrices: boolean
): ProjectedProduct<T> {
    if (canViewPrices) {
        return product as unknown as ProjectedProduct<T>;
    }

    return {
        ...product,
        price: null,
        discountPrice: null,
        discountType: null,
        discountValue: null,
    };
}

/**
 * Redacts wholesale pricing information for a list of products.
 */
export function projectProductsPrices<T extends Record<string, any>>(
    products: T[],
    canViewPrices: boolean
): ProjectedProduct<T>[] {
    if (canViewPrices) {
        return products as unknown as ProjectedProduct<T>[];
    }

    return products.map((p) => projectProductPrices(p, false));
}

/**
 * Redacts wholesale pricing from order payloads for unauthorized callers.
 */
export function projectOrderPrices<T extends Record<string, any>>(
    order: T,
    canViewPrices: boolean
): T {
    if (canViewPrices) {
        return order;
    }

    return {
        ...order,
        totalAmount: 0,
        discount: 0,
        items: Array.isArray(order.items)
            ? order.items.map((item: any) => ({
                  ...item,
                  price: 0,
                  product: item.product ? projectProductPrices(item.product, false) : item.product,
              }))
            : order.items,
    };
}

/**
 * Redacts wholesale pricing from an array of order payloads.
 */
export function projectOrdersPrices<T extends Record<string, any>>(
    orders: T[],
    canViewPrices: boolean
): T[] {
    if (canViewPrices) {
        return orders;
    }

    return orders.map((o) => projectOrderPrices(o, false));
}
