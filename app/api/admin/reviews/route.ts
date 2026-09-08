import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { adminApiError } from "@/lib/admin-api";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession("REVIEWS_VIEW");
    const cursor = request.nextUrl.searchParams.get("cursor");
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")) || 50, 1), 100);
    const [rows, total] = await Promise.all([
      prisma.review.findMany({
        where: { archivedAt: null },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: { product: { select: { name: true } } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      prisma.review.count({ where: { archivedAt: null } }),
    ]);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const nextCursor = hasMore ? items.at(-1)?.id ?? null : null;
    return NextResponse.json({ items, total, nextCursor, previousCursor: cursor ? items[0]?.id ?? null : null });
  } catch (error) {
    return adminApiError(error);
  }
}

