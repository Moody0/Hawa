import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminAuditEvent {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export async function writeAdminAuditLog(event: AdminAuditEvent) {
  return prisma.adminAuditLog.create({
    data: {
      actorId: event.actorId ?? null,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId ?? null,
      metadata: event.metadata,
    },
    select: { id: true },
  });
}

