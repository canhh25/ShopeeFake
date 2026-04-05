import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/client.js";
import { getJwtSecret } from "../config/env.js";

const SALT_ROUNDS = 10;

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("Email đã được sử dụng", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const name =
    typeof input.name === "string" && input.name.trim() !== ""
      ? input.name.trim()
      : null;

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError("Email hoặc mật khẩu không đúng", 401);
  }

  const match = await bcrypt.compare(input.password, user.password);
  if (!match) {
    throw new AuthError("Email hoặc mật khẩu không đúng", 401);
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}
