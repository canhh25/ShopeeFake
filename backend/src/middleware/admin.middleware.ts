import type { RequestHandler } from "express";
import prisma from "../db/client.js";
import { ADMIN_ROLE } from "../services/admin.service.js";

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Chưa xác thực" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) {
      res.status(401).json({ error: "Người dùng không tồn tại" });
      return;
    }
    if (user.role !== ADMIN_ROLE) {
      res.status(403).json({ error: "Chỉ quản trị viên mới được truy cập" });
      return;
    }
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
