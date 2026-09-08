import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidAdminSession } from "@/lib/admin-auth";
import { getAuthenticatedCustomer } from "@/lib/customer-auth";
import { cookies } from "next/headers";
import { 
    verifyOrderAccessToken, 
    GUEST_ORDER_SESSION_COOKIE, 
    isOrderAuthorizedInGuestSession, 
    addOrderToGuestSession 
} from "@/lib/order-token";
import { projectOrderPrices } from "@/lib/price-visibility";
import { CONTACT_CONFIG } from "@/lib/site-config";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [adminUser, customer] = await Promise.all([
            getValidAdminSession().catch(() => null),
            getAuthenticatedCustomer(),
        ]);

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { message: "Order not found" },
                { status: 404 }
            );
        }

        const cookieStore = await cookies();
        const guestOrdersCookie = cookieStore.get(GUEST_ORDER_SESSION_COOKIE)?.value;
        const legacyCookieToken = cookieStore.get(`order_access_${order.id}`)?.value;

        const url = new URL(request.url);
        const queryToken = url.searchParams.get("token");
        const headerToken = request.headers.get("x-order-token");

        const hasValidToken =
            isOrderAuthorizedInGuestSession(guestOrdersCookie, order.id) ||
            verifyOrderAccessToken(order.id, legacyCookieToken) ||
            verifyOrderAccessToken(order.id, queryToken) ||
            verifyOrderAccessToken(order.id, headerToken);

        // Authorization check: must be admin OR the authenticated owner of the order OR possess a valid signed order token
        const isAuthorized =
            Boolean(adminUser) ||
            Boolean(customer && order.customerId === customer.id) ||
            hasValidToken;

        if (!isAuthorized) {
            return NextResponse.json(
                { message: "Unauthorized access to order details" },
                { status: 403 }
            );
        }

        const settings = await prisma.settings.findUnique({
            where: { id: "site-settings" },
            select: { whatsappNumber: true }
        });
        const whatsappNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || CONTACT_CONFIG.salesWhatsApp;

        const canViewPricing = Boolean(adminUser || (customer && customer.isActive));
        const responseOrder = projectOrderPrices(order, canViewPricing);

        const response = NextResponse.json({ ...responseOrder, whatsappNumber });

        // If authorized via query or header token, promptly exchange it into the scoped session cookie
        const validExplicitToken = (queryToken && verifyOrderAccessToken(order.id, queryToken))
            ? queryToken
            : (headerToken && verifyOrderAccessToken(order.id, headerToken))
                ? headerToken
                : null;

        if (validExplicitToken) {
            const updatedSession = addOrderToGuestSession(guestOrdersCookie, order.id, validExplicitToken);
            response.cookies.set(GUEST_ORDER_SESSION_COOKIE, updatedSession, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60,
            });
        }

        return response;
    } catch (error) {
        console.error("Fetch order error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
