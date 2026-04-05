import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";

export const requireAuth: RequestHandler = (req, res, next) => {
  const raw = req.headers.authorization;
  if (!raw?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Cần đăng nhập để thực hiện thao tác này" });
    return;
  }
  const token = raw.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: "Token không hợp lệ" });
    return;
  }
  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & {
      sub?: string;
      email?: string;
    };
    const userId = typeof payload.sub === "string" ? payload.sub : undefined;
    const email = typeof payload.email === "string" ? payload.email : undefined;
    if (!userId || !email) {
      res.status(401).json({ error: "Token không hợp lệ" });
      return;
    }
    req.auth = { userId, email };
    next();
  } catch {
    res.status(401).json({ error: "Phiên đăng nhập hết hạn hoặc không hợp lệ" });
  }
};
