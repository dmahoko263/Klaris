import { DataTypes, Model } from "sequelize";

export class UserProfile extends Model {}

export function initUserProfile(sequelize) {
  UserProfile.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      fullName: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING },
      organizationName: { type: DataTypes.STRING },
    },
    { sequelize, modelName: "UserProfile", tableName: "user_profiles", underscored: true }
  );
}