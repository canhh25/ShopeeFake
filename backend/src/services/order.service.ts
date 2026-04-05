import prisma from "../db/client.js";

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export type CheckoutLineInput = {
  productId: string;
  quantity: number;
};

export type CheckoutPayload = {
  phone: string;
  shippingAddress: string;
  items: CheckoutLineInput[];
};

function mergeQuantities(items: CheckoutLineInput[]): Map<string, number> {
  const merged = new Map<string, number>();
  for (const it of items) {
    if (typeof it.productId !== "string" || it.productId.trim() === "") {
      throw new CheckoutError("Dữ liệu sản phẩm không hợp lệ", 400);
    }
    const q = Math.floor(Number(it.quantity));
    if (!Number.isFinite(q) || q < 1) {
      throw new CheckoutError("Số lượng không hợp lệ", 400);
    }
    const id = it.productId.trim();
    merged.set(id, (merged.get(id) ?? 0) + q);
  }
  return merged;
}

export async function checkoutOrder(userId: string, payload: CheckoutPayload) {
  const phone = payload.phone?.trim() ?? "";
  const shippingAddress = payload.shippingAddress?.trim() ?? "";
  if (phone === "") {
    throw new CheckoutError("Số điện thoại giao hàng là bắt buộc", 400);
  }
  if (shippingAddress === "") {
    throw new CheckoutError("Địa chỉ giao hàng là bắt buộc", 400);
  }
  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new CheckoutError("Giỏ hàng trống", 400);
  }

  const merged = mergeQuantities(payload.items);
  const productIds = [...merged.keys()];

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, isBlocked: true },
    });
    if (!user) {
      throw new CheckoutError("Người dùng không tồn tại", 401);
    }
    if (user.isBlocked) {
      throw new CheckoutError("Tài khoản đã bị khóa, không thể đặt hàng", 403);
    }

    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new CheckoutError("Có sản phẩm không tồn tại", 400);
    }

    let totalAmount = 0;
    const lines: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
      name: string;
    }[] = [];

    for (const [productId, quantity] of merged) {
      const p = products.find((x) => x.id === productId)!;
      if (p.stock < quantity) {
        throw new CheckoutError(`Sản phẩm ${p.name} đã hết hàng`, 409);
      }
      totalAmount += p.price * quantity;
      lines.push({
        productId,
        quantity,
        priceAtPurchase: p.price,
        name: p.name,
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING",
        phone,
        shippingAddress,
        orderItems: {
          create: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            priceAtPurchase: l.priceAtPurchase,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    for (const l of lines) {
      const updated = await tx.product.updateMany({
        where: { id: l.productId, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (updated.count !== 1) {
        throw new CheckoutError(
          `Sản phẩm ${l.name} đã hết hàng`,
          409
        );
      }
    }

    return order;
  });
}
