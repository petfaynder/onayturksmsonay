import prisma from "./db";

export async function createAuditLog({
  adminId,
  adminEmail,
  action,
  targetType,
  targetId,
  details,
}: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: { adminId, adminEmail, action, targetType, targetId, details },
    });
  } catch (e) {
    // Non-critical - don't fail main operation
    console.warn("Audit log failed:", e);
  }
}