import { DataTypes, Model } from "sequelize";

export class User extends Model {}

export function initUser(sequelize) {
  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "manufacturer", "distributor", "patient"),
        allowNull: false,
        defaultValue: "patient",
      },
      walletAddress: { type: DataTypes.STRING, allowNull: true, unique: true },
      isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: "User", tableName: "users", underscored: true }
  );
}