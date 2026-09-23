import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { adminApiError } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        await requireAdminSession("SITE_CONTENT_VIEW");

        const search = request.nextUrl.searchParams.get("search")?.trim() || "";
        const status = request.nextUrl.searchParams.get("status") || "ALL";

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const whereClause: any = {
            archivedAt: null,
        };

        if (status === "UNREAD") {
            whereClause.isRead = false;
        } else if (status === "READ") {
            whereClause.isRead = true;
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { shopName: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { message: { contains: search, mode: "insensitive" } },
            ];
        }

        const [items, total, unreadCount, todayCount] = await Promise.all([
            prisma.contactMessage.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                take: 100,
            }),
            prisma.contactMessage.count({
                where: { archivedAt: null },
            }),
            prisma.contactMessage.count({
                where: { archivedAt: null, isRead: false },
            }),
            prisma.contactMessage.count({
                where: {
                    archivedAt: null,
                    createdAt: { gte: startOfToday },
                },
            }),
        ]);

        return NextResponse.json({
            items,
            total,
            unreadCount,
            todayCount,
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
        });
    } catch (error) {
        return adminApiError(error);
    }
}
