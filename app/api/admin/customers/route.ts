import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, type AdminUserSession } from "@/lib/admin-auth";
import { adminApiError, validationError } from "@/lib/admin-api";
import { customerStatusSchema, identifierSchema, zodFieldErrors } from "@/lib/admin-validation";
import { writeAdminAuditLog } from "@/lib/admin-audit";

export async function GET(request: Request) {
  try {
    await requireAdminSession("CUSTOMERS_VIEW");
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 100);
    const search = url.searchParams.get("search")?.trim().slice(0, 200);
    const active = url.searchParams.get("active");
    const where = {
      archivedAt: null,
      ...(active === "true" || active === "false" ? { isActive: active === "true" } : {}),
      ...(search ? { OR: [
        { shopName: { contains: search, mode: "insensitive" as const } },
        { ownerName: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { city: { contains: search, mode: "insensitive" as const } },
      ] } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { _count: { select: { orders: true, wishlist: true } } },
      }),
      prisma.customer.count({ where }),
    ]);
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);
    const ids = page.map((customer) => customer.id);
    const spending = ids.length ? await prisma.order.groupBy({
      by: ["customerId"],
      where: { customerId: { in: ids }, status: { not: "CANCELLED" }, archivedAt: null },
      _sum: { totalAmount: true },
    }) : [];
    const spent = new Map(spending.map((row) => [row.customerId, Number(row._sum.totalAmount || 0)]));
    const items = page.map((customer) => ({
      id: customer.id,
      shopName: customer.shopName,
      ownerName: customer.ownerName,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      ordersCount: customer._count.orders,
      wishlistCount: customer._count.wishlist,
      totalSpent: spent.get(customer.id) || 0,
    }));
    const nextCursor = hasMore ? items.at(-1)?.id ?? null : null;
    return NextResponse.json({
      items, total, nextCursor, previousCursor: cursor ? items[0]?.id ?? null : null,
      success: true, customers: items,
      pagination: { total, hasMore, nextCursor, limit },
    });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdminSession("CUSTOMERS_MANAGE");
    const parsed = customerStatusSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(zodFieldErrors(parsed.error));
    const customer = await prisma.customer.update({ where: { id: parsed.data.id, archivedAt: null }, data: { isActive: parsed.data.isActive } });
    const audit = await writeAdminAuditLog({
      actorId: (session.user as AdminUserSession).id,
      action: parsed.data.isActive ? "ENABLE" : "DISABLE",
      entityType: "Customer",
      entityId: customer.id,
    });
    return NextResponse.json({ ok: true, success: true, data: customer, customer, auditId: audit.id });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdminSession("CUSTOMERS_ARCHIVE");
    const id = identifierSchema.safeParse(new URL(request.url).searchParams.get("id"));
    if (!id.success) return validationError({ id: ["A valid customer ID is required"] });
    const customer = await prisma.customer.update({ where: { id: id.data, archivedAt: null }, data: { archivedAt: new Date(), isActive: false } });
    const audit = await writeAdminAuditLog({ actorId: (session.user as AdminUserSession).id, action: "ARCHIVE", entityType: "Customer", entityId: customer.id });
    return NextResponse.json({ ok: true, success: true, data: customer, auditId: audit.id });
  } catch (error) {
    return adminApiError(error);
  }
}

