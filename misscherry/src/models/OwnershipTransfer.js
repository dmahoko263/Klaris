import { DataTypes, Model } from "sequelize";

export class OwnershipTransfer extends Model {}

export function initOwnershipTransfer(sequelize) {
  OwnershipTransfer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      chainId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contractAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      batchId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      fromWallet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      toWallet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      txHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      blockNumber: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OwnershipTransfer",
      tableName: "ownership_transfers",
      underscored: true,
      indexes: [
        { fields: ["batch_id"] },
        { fields: ["tx_hash"] },
      ],
    }
  );
}