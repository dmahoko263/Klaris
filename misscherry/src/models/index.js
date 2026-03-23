import { sequelize } from "../db/sequelize.js";
import { initUser, User } from "./User.js";
import { initUserProfile, UserProfile } from "./UserProfile.js";
import { initVerification, Verification } from "./Verification.js";
import { initAuditLog, AuditLog } from "./AuditLog.js";
import { initBatchCache, BatchCache } from "./BatchCache.js";
import { initWalletRole, WalletRole } from "./walletRole.js";
import { initOwnershipTransfer, OwnershipTransfer } from "./OwnershipTransfer.js";
import { initContractDeployment, ContractDeployment } from "./ContractDeployment.js";
export function initModels() {
  initUser(sequelize);
  initUserProfile(sequelize);
  initVerification(sequelize);
  initAuditLog(sequelize);
  initBatchCache(sequelize);
  
initWalletRole(sequelize);
initOwnershipTransfer(sequelize);
initContractDeployment(sequelize);

  // associations
  User.hasOne(UserProfile, { foreignKey: { name: "userId", allowNull: false }, onDelete: "CASCADE" });
  UserProfile.belongsTo(User, { foreignKey: "userId" });

  User.hasMany(Verification, { foreignKey: { name: "scannedByUserId", allowNull: true } });
  Verification.belongsTo(User, { foreignKey: "scannedByUserId" });

  User.hasMany(AuditLog, { foreignKey: { name: "actorUserId", allowNull: true } });
  AuditLog.belongsTo(User, { foreignKey: "actorUserId" });

  return { User, UserProfile, Verification, AuditLog, BatchCache };
}

export {  sequelize,
  User,
  UserProfile,
  Verification,
  AuditLog,
  BatchCache,
  WalletRole,
  OwnershipTransfer,
  ContractDeployment,};
