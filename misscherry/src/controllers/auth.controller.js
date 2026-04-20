import { z } from "zod";
import { registerUser, loginUser } from "../services/auth.service.js";
import { User, UserProfile } from "../models/index.js";
import { ethers } from "ethers";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z
    .enum(["admin", "manufacturer", "distributor", "pharmacy", "patient"])
    .default("patient"),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  organizationName: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  walletAddress: z.string().optional(),
});

export async function register(req, res) {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload);
    res.status(201).json({ ok: true, token: result.token, user: result.user });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json({ ok: true, token: result.token, user: result.user });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "email",
        "role",
        "walletAddress",
        "isActive",
        "createdAt",
      ],
      include: [
        {
          model: UserProfile,
          as: "profile",
          attributes: [
            "fullName",
            "phone",
            "organizationName",
            "address",
            "country",
            "website",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      ok: true,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        isActive: user.isActive,
        createdAt: user.createdAt,
        fullName: user.profile?.fullName || null,
        phone: user.profile?.phone || null,
        organizationName: user.profile?.organizationName || null,
        address: user.profile?.address || null,
        country: user.profile?.country || null,
        website: user.profile?.website || null,
      })),
    });
  } catch (e) {
    console.error("GET_ALL_USERS_ERROR:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function updateUserWallet(req, res) {
  try {
    const { id } = req.params;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res
        .status(400)
        .json({ ok: false, error: "Wallet address is required" });
    }

    let checksummed;
    try {
      checksummed = ethers.getAddress(walletAddress);
    } catch {
      return res
        .status(400)
        .json({ ok: false, error: "Invalid Ethereum address" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const existing = await User.findOne({ where: { walletAddress: checksummed } });
    if (existing && existing.id !== id) {
      return res
        .status(409)
        .json({ ok: false, error: "Wallet address already in use" });
    }

    await user.update({ walletAddress: checksummed });

    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function toggleUserActive(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    await user.update({ isActive: !user.isActive });

    res.json({ ok: true, isActive: user.isActive });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}