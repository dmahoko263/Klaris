import { DataTypes, Model } from "sequelize";

export class NetworkActivity extends Model {}

export function initNetworkActivity(sequelize) {
  NetworkActivity.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM(
          "NODE_START",
          "DEPLOY",
          "CALL",
          "TX_SUCCESS",
          "TX_REVERTED"
        ),
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      functionName: {
        type: DataTypes.STRING,
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
      fromAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      toAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gasUsed: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "NetworkActivity",
      tableName: "network_activities",
      underscored: true,
    }
  );
}