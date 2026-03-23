import { DataTypes, Model } from "sequelize";

export class AuditLog extends Model {}

export function initAuditLog(sequelize) {
  AuditLog.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      actorWallet: { type: DataTypes.STRING },
      action: { type: DataTypes.STRING, allowNull: false },
      entityType: { type: DataTypes.STRING },
      entityId: { type: DataTypes.STRING },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    { sequelize, modelName: "AuditLog", tableName: "audit_logs", underscored: true }
  );
}