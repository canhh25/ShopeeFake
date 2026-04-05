import type { RequestHandler } from "express";
import { AuthError, loginUser, registerUser } from "../services/auth.service.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseString(body: unknown, key: string): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const v = (body as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}

export const register: RequestHandler = async (req, res) => {
  const email = parseString(req.body, "email");
  const password = parseString(req.body, "password");
  const name = parseString(req.body, "name");

  if (!email || !password) {
    res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
    return;
  }
  if (!EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: "Email không hợp lệ" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Mật khẩu tối thiểu 6 ký tự" });
    return;
  }

  try {
    const user = await registerUser({ email, password, name });
    res.status(201).json({ user });
  } catch (e) {
    if (e instanceof AuthError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const login: RequestHandler = async (req, res) => {
  const email = parseString(req.body, "email");
  const password = parseString(req.body, "password");

  if (!email || !password) {
    res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
    return;
  }

  try {
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (e) {
    if (e instanceof AuthError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
