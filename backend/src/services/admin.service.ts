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

// ─── Dashboard Stats ───────────────────────────────────────────

export type DashboardStats = {
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  topProducts: { productId: string; name: string; totalSold: number }[];
  revenueByDay: { date: string; revenue: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, topProducts] = await Promise.all([
    // Lấy tất cả đơn hàng
    prisma.order.findMany({
      select: {
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
    // Top 5 sản phẩm bán chạy
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Tổng doanh thu
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Đơn hàng theo trạng thái
  const ordersByStatus: Record<string, number> = {};
  for (const o of orders) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
  }

  // Doanh thu theo ngày (30 ngày gần nhất)
  const revenueMap = new Map<string, number>();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  for (const o of orders) {
    if (o.createdAt < cutoff) continue;
    const date = o.createdAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
    revenueMap.set(date, (revenueMap.get(date) ?? 0) + o.totalAmount);
  }
  const revenueByDay = [...revenueMap.entries()]
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Lấy tên sản phẩm cho top products
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const nameMap = new Map(products.map((p) => [p.id, p.name]));

  const topProductsMapped = topProducts.map((p) => ({
    productId: p.productId,
    name: nameMap.get(p.productId) ?? "Không rõ",
    totalSold: p._sum.quantity ?? 0,
  }));

  return { totalRevenue, ordersByStatus, topProducts: topProductsMapped, revenueByDay };
}