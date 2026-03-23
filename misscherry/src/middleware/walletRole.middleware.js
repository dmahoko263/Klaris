import { getWalletRole } from "../services/walletRole.service.js";

export function requireWalletRole(role) {

  return async (req, res, next) => {

    const wallet = req.user.walletAddress;
console.log("Wallet: ",wallet)
    const record = await getWalletRole(wallet);

    if (!record || record.role !== role) {
      return res.status(403).json({
        ok: false,
        message: "Insufficient role",
      });
    }

    next();
  };

} 