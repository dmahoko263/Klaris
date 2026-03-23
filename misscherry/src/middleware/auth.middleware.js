import { verifyToken } from "../utils/jwt.js";

export function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "Missing token" });
  console.log(res.status)
  
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ ok: false, error: "Invalid token" });
    console.log(res.status)
  }
}