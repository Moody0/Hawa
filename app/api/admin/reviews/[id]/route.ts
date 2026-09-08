import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, type AdminUserSession } from "@/lib/admin-auth";
import { adminApiError, validationError } from "@/lib/admin-api";
import { reviewStatusSchema, zodFieldErrors } from "@/lib/admin-validation";
import { writeAdminAuditLog } from "@/lib/admin-audit";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession("REVIEWS_MANAGE");
    const { id } = await props.params;
    const parsed = reviewStatusSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(zodFieldErrors(parsed.error));
    const review = await prisma.review.update({ where: { id, archivedAt: null }, data: parsed.data });
    await writeAdminAuditLog({ actorId: (session.user as AdminUserSession).id, action: "UPDATE", entityType: "Review", entityId: id, metadata: parsed.data });
    return NextResponse.json(review);
  } catch (error) {
    return adminApiError(error);
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession("REVIEWS_ARCHIVE");
    const { id } = await props.params;
    await prisma.review.update({ where: { id, archivedAt: null }, data: { archivedAt: new Date(), isApproved: false } });
    const audit = await writeAdminAuditLog({ actorId: (session.user as AdminUserSession).id, action: "ARCHIVE", entityType: "Review", entityId: id });
    return NextResponse.json({ ok: true, success: true, auditId: audit.id });
  } catch (error) {
    return adminApiError(error);
  }
}
