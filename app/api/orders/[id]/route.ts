import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthenticatedCustomer } from "@/lib/customer-auth";
import { cookies } from "next/headers";
import { verifyOrderAccessToken } from "@/lib/order-token";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [adminSession, customer] = await Promise.all([
            getServerSession(authOptions),
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
        const orderCookieToken = cookieStore.get(`order_access_${order.id}`)?.value;

        const url = new URL(request.url);
        const queryToken = url.searchParams.get("token");
        const headerToken = request.headers.get("x-order-token");

        const hasValidToken =
            verifyOrderAccessToken(order.id, orderCookieToken) ||
            verifyOrderAccessToken(order.id, queryToken) ||
            verifyOrderAccessToken(order.id, headerToken);

        // Authorization check: must be admin OR the owner of the order OR possess a valid signed order token
        const isAuthorized =
            Boolean(adminSession?.user) ||
            Boolean(
                customer &&
                (order.customerId === customer.id || (order.phone && customer.phone && order.phone === customer.phone))
            ) ||
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
        const whatsappNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+963900000000";

        return NextResponse.json({ ...order, whatsappNumber });
    } catch (error) {
        console.error("Fetch order error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
