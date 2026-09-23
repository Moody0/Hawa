import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, type AdminUserSession } from "@/lib/admin-auth";
import { adminApiError } from "@/lib/admin-api";
import { writeAdminAuditLog } from "@/lib/admin-audit";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdminSession("SITE_CONTENT_MANAGE");
        const { id } = await props.params;
        const body = await request.json();

        const updateData: any = {};
        if (typeof body.isRead === "boolean") {
            updateData.isRead = body.isRead;
        }
        if (typeof body.notes === "string") {
            updateData.notes = body.notes.slice(0, 2000);
        }

        const message = await prisma.contactMessage.update({
            where: { id, archivedAt: null },
            data: updateData,
        });

        await writeAdminAuditLog({
            actorId: (session.user as AdminUserSession).id,
            action: "UPDATE",
            entityType: "ContactMessage",
            entityId: id,
            metadata: updateData,
        });

        return NextResponse.json(message);
    } catch (error) {
        return adminApiError(error);
    }
}

export async function DELETE(
    _request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdminSession("SITE_CONTENT_ARCHIVE");
        const { id } = await props.params;

        await prisma.contactMessage.update({
            where: { id, archivedAt: null },
            data: { archivedAt: new Date() },
        });

        const audit = await writeAdminAuditLog({
            actorId: (session.user as AdminUserSession).id,
            action: "ARCHIVE",
            entityType: "ContactMessage",
            entityId: id,
        });

        return NextResponse.json({ ok: true, success: true, auditId: audit.id });
    } catch (error) {
        return adminApiError(error);
    }
}
