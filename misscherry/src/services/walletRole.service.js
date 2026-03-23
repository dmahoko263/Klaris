import { WalletRole } from "../models/index.js";

function normalizeWallet(walletAddress) {
  if (!walletAddress || typeof walletAddress !== "string") {
    throw new Error("Invalid wallet address");
  }
  return walletAddress.toLowerCase();
}


export async function createOrUpdateWalletRole(walletAddress, role) {
  const normalized = normalizeWallet(walletAddress);

  const existing = await WalletRole.findOne({
    where: { walletAddress: normalized },
  });

  if (existing) {
    existing.role = role;
    existing.active = true;
    await existing.save();
    return existing;
  }

  return WalletRole.create({
    walletAddress: normalized,
    role,
    active: true,
  });
}

export async function getWalletRole(walletAddress) {
    const normalized = normalizeWallet(walletAddress);
  return WalletRole.findOne({
    where: {
      walletAddress: normalized,
      active: true,
    },
  });
}

export async function getAllWalletRoles() {
  return WalletRole.findAll({
    order: [["createdAt", "DESC"]],
  });
}

export async function deactivateWalletRole(walletAddress) {
  const normalized = normalizeWallet(walletAddress);

  const existing = await WalletRole.findOne({
    where: { walletAddress: normalized },
  });

  if (!existing) {
    throw new Error("Wallet role not found");
  }

  existing.active = false;
  await existing.save();

  return existing;
}

export async function deleteWalletRole(walletAddress) {
  const normalized = normalizeWallet(walletAddress);

  const deleted = await WalletRole.destroy({
    where: { walletAddress: normalized },
  });

  if (!deleted) {
    throw new Error("Wallet role not found");
  }

  return true;
}