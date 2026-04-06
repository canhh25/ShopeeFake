import type { RequestHandler } from "express";
import {
  AdminUserError,
  getDashboardStats,
  listAllUsersPublic,
  toggleUserBlocked,
} from "../services/admin.service.js";

function routeId(req: { params: Record<string, string | string[] | undefined> }): string | undefined {
  const v = req.params.id;
  if (typeof v === "string" && v) return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export const listUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await listAllUsersPublic();
    res.json({ users });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const toggleUserBlock: RequestHandler = async (req, res) => {
  const actorId = req.auth?.userId;
  if (!actorId) {
    res.status(401).json({ error: "Chưa xác thực" });
    return;
  }
  const id = routeId(req);
  if (!id) {
    res.status(400).json({ error: "Thiếu mã người dùng" });
    return;
  }
  try {
    const user = await toggleUserBlocked(actorId, id);
    res.json({ user });
  } catch (e) {
    if (e instanceof AdminUserError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const getStats: RequestHandler = async (_req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ stats });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};