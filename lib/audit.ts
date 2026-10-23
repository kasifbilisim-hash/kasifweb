import "server-only";
import { db, schema } from "@/lib/db";

/** Her yönetici işlemi ve abonelik durum değişikliği buraya yazılır. actorUserId null = sistem/webhook. */
export async function writeAudit(entry: {
  actorUserId: string | null;
  action: string;
  targetTable: string;
  targetId?: string;
  details?: Record<string, unknown>;
}) {
  await db.insert(schema.auditLog).values({
    actorUserId: entry.actorUserId,
    action: entry.action,
    targetTable: entry.targetTable,
    targetId: entry.targetId,
    details: entry.details,
  });
}
