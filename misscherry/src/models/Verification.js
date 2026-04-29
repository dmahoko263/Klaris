import { DataTypes, Model } from "sequelize";

export class Verification extends Model {}

export function initVerification(sequelize) {
  Verification.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      chainId: { type: DataTypes.INTEGER, allowNull: false },
      contractAddress: { type: DataTypes.STRING, allowNull: false },
      batchId: { type: DataTypes.STRING, allowNull: false },
      method: { type: DataTypes.ENUM("ID", "QR", "ENGRAVED"), allowNull: false },
      inputValue: { type: DataTypes.TEXT, allowNull: false },
      resultValid: { type: DataTypes.BOOLEAN, allowNull: false },
      resultReason: { type: DataTypes.TEXT },
      scannedByWallet: { type: DataTypes.STRING },
    },
    { sequelize, modelName: "Verification", tableName: "verifications", underscored: true }
  );
}