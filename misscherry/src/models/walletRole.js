import { DataTypes, Model } from "sequelize";

export class WalletRole extends Model {}

export function initWalletRole(sequelize) {
  WalletRole.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      walletAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
          this.setDataValue("walletAddress", value?.toLowerCase());
        },
      },
      role: {
        type: DataTypes.ENUM(
          "admin",
          "manufacturer",
          "distributor",
          "pharmacy",
          "patient"
        ),
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "WalletRole",
      tableName: "wallet_roles",
      underscored: true,
    }
  );
}