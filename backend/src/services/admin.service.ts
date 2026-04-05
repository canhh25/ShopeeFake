import prisma from "../db/client.js";

export const ADMIN_ROLE = "ADMIN";
export const CUSTOMER_ROLE = "CUSTOMER";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  shippingAddress: true,
  role: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  shippingAddress: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function listAllUsersPublic(): Promise<PublicUser[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: publicUserSelect,
  });
  return rows;
}

export class AdminUserError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "AdminUserError";
  }
}

export async function toggleUserBlocked(
  actorUserId: string,
  targetUserId: string
): Promise<PublicUser> {
  if (actorUserId === targetUserId) {
    throw new AdminUserError("Không thể chặn chính mình", 400);
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, isBlocked: true },
  });
  if (!target) {
    throw new AdminUserError("Không tìm thấy người dùng", 404);
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isBlocked: !target.isBlocked },
    select: publicUserSelect,
  });

  return updated;
}
