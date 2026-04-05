import type { RequestHandler } from "express";
import { getProfileByUserId, updateProfile } from "../services/profile.service.js";

function mergeStringField(
  body: Record<string, unknown>,
  key: string,
  previous: string | null
): string | null {
  if (!(key in body)) return previous;
  const v = body[key];
  if (v === null) return null;
  if (typeof v !== "string") return previous;
  const t = v.trim();
  return t === "" ? null : t;
}

export const getMe: RequestHandler = async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Chưa xác thực" });
    return;
  }
  try {
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: "Không tìm thấy người dùng" });
      return;
    }
    res.json({ profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const patchMe: RequestHandler = async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Chưa xác thực" });
    return;
  }

  if (!req.body || typeof req.body !== "object") {
    res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    return;
  }
  const body = req.body as Record<string, unknown>;

  try {
    const current = await getProfileByUserId(userId);
    if (!current) {
      res.status(404).json({ error: "Không tìm thấy người dùng" });
      return;
    }

    const name = mergeStringField(body, "name", current.name);
    const phone = mergeStringField(body, "phone", current.phone);
    const shippingAddress = mergeStringField(
      body,
      "shippingAddress",
      current.shippingAddress
    );

    if (phone !== null && phone.length > 20) {
      res.status(400).json({ error: "Số điện thoại quá dài" });
      return;
    }
    if (shippingAddress !== null && shippingAddress.length > 2000) {
      res.status(400).json({ error: "Địa chỉ quá dài" });
      return;
    }

    const profile = await updateProfile(userId, {
      name,
      phone,
      shippingAddress,
    });
    res.json({ profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
