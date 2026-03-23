import jwt from "jsonwebtoken";
import "dotenv/config";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}