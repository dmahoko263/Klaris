import { DataTypes, Model } from "sequelize";

export class BatchCache extends Model {}

export function initBatchCache(sequelize) {
  BatchCache.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      chainId: { type: DataTypes.INTEGER, allowNull: false },
      contractAddress: { type: DataTypes.STRING, allowNull: false },
      batchId: { type: DataTypes.BIGINT, allowNull: false },
      drugName: { type: DataTypes.STRING, allowNull: false },
      manufacturer: { type: DataTypes.STRING, allowNull: false },
      expiryDate: { type: DataTypes.BIGINT, allowNull: false },
      txHash: { type: DataTypes.STRING },
      blockNumber: { type: DataTypes.BIGINT },
    },
    {
      sequelize,
      modelName: "BatchCache",
      tableName: "batches",
      underscored: true,
      indexes: [{ unique: true, fields: ["chain_id", "contract_address", "batch_id"] }],
    }
  );
}