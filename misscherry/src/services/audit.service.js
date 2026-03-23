import { AuditLog } from "../models/index.js";

export async function logAudit({ actorUserId = null, actorWallet = null, action, entityType = null, entityId = null, metadata = {} }) {
  return AuditLog.create({ actorUserId, actorWallet, action, entityType, entityId, metadata });
}