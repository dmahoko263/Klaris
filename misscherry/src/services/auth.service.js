import bcrypt from "bcrypt";
import { User, UserProfile } from "../models/index.js";
import { signToken } from "../utils/jwt.js";

const ORG_ROLES = ["manufacturer", "distributor", "pharmacy"];

function normalize(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function buildUserResponse(user, profile) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
    fullName: profile?.fullName || null,
    phone: profile?.phone || null,
    organizationName: profile?.organizationName || null,
    address: profile?.address || null,
    country: profile?.country || null,
    website: profile?.website || null,
  };
}

export async function registerUser({
  email,
  password,
  role,
  fullName,
  phone,
  organizationName,
  address,
  country,
  website,
  walletAddress,
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedWallet = normalize(walletAddress);
  const normalizedFullName = normalize(fullName);
  const normalizedPhone = normalize(phone);
  const normalizedOrganizationName = normalize(organizationName);
  const normalizedAddress = normalize(address);
  const normalizedCountry = normalize(country);
  const normalizedWebsite = normalize(website);

  const exists = await User.findOne({ where: { email: normalizedEmail } });
  if (exists) throw new Error("Email already exists");

  if (normalizedWallet) {
    const existingWallet = await User.findOne({
      where: { walletAddress: normalizedWallet },
    });
    if (existingWallet) throw new Error("Wallet address already in use");
  }

  if (
    ORG_ROLES.includes(role) &&
    (
      !normalizedOrganizationName ||
      !normalizedAddress ||
      !normalizedCountry ||
      !normalizedPhone ||
      !normalizedWallet
    )
  ) {
    throw new Error(
      "organizationName, address, country, phone, and walletAddress are required for this role"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    walletAddress: normalizedWallet,
  });

  const profile = await UserProfile.create({
    userId: user.id,
    fullName: normalizedFullName,
    phone: normalizedPhone,
    organizationName: normalizedOrganizationName,
    address: normalizedAddress,
    country: normalizedCountry,
    website: normalizedWebsite,
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
  });

  return {
    token,
    user: buildUserResponse(user, profile),
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    where: { email: normalizedEmail },
    include: [
      {
        model: UserProfile,
        as: "profile",
      },
    ],
  });

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
    user: buildUserResponse(user, user.profile),
  };
}