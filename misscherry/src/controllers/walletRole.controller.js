import {
  createOrUpdateWalletRole,
  getWalletRole,
  getAllWalletRoles,
  deactivateWalletRole,
  deleteWalletRole,
} from "../services/walletRole.service.js";

export async function createWalletRole(req, res) {
  try {
    const { walletAddress, role } = req.body;

    if (!walletAddress || !role) {
      return res.status(400).json({
        ok: false,
        error: "walletAddress and role are required",
      });
    }

    const result = await createOrUpdateWalletRole(walletAddress, role);

    res.status(201).json({
      ok: true,
      walletRole: result,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
    });
  }
}

export async function fetchWalletRole(req, res) {
  try {
    const { walletAddress } = req.params;

    const result = await getWalletRole(walletAddress);

    if (!result) {
      return res.status(404).json({
        ok: false,
        error: "Wallet role not found",
      });
    }

    res.json({
      ok: true,
      walletRole: result,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
    });
  }
}

export async function fetchAllWalletRoles(req, res) {
  try {
    const result = await getAllWalletRoles();

    res.json({
      ok: true,
      walletRoles: result,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
    });
  }
}

export async function disableWalletRole(req, res) {
  try {
    const { walletAddress } = req.params;

    const result = await deactivateWalletRole(walletAddress);

    res.json({
      ok: true,
      walletRole: result,
    });
  } catch (e) {
    res.status(404).json({
      ok: false,
      error: e.message,
    });
  }
}

export async function removeWalletRole(req, res) {
  try {
    const { walletAddress } = req.params;

    await deleteWalletRole(walletAddress);

    res.json({
      ok: true,
      message: "Wallet role deleted successfully",
    });
  } catch (e) {
    res.status(404).json({
      ok: false,
      error: e.message,
    });
  }
}