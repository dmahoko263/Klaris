import bcrypt from "bcrypt";
import { User, UserProfile } from "../models/index.js";
import { signToken } from "../utils/jwt.js";

export async function registerUser({ email, password, role, fullName, phone, organizationName, walletAddress }) {
  const exists = await User.findOne({ where: { email } });
  if (exists) throw new Error("Email already exists");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email,
    passwordHash,
    role,
    walletAddress: walletAddress || null,
  });

  await UserProfile.create({
    userId: user.id,
    fullName,
    phone: phone || null,
    organizationName: organizationName || null,
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid credentials");
  if (!user.isActive) throw new Error("Account disabled");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
  };
}