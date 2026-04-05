import type { RequestHandler } from "express";
import { checkoutOrder, CheckoutError } from "../services/order.service.js";

export const checkout: RequestHandler = async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Chưa xác thực" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const phone = typeof body.phone === "string" ? body.phone : "";
  const shippingAddress =
    typeof body.shippingAddress === "string" ? body.shippingAddress : "";
  const rawItems = body.items;

  if (!Array.isArray(rawItems)) {
    res.status(400).json({ error: "Danh sách sản phẩm không hợp lệ" });
    return;
  }

  const items = rawItems.map((row) => {
    if (!row || typeof row !== "object") return { productId: "", quantity: 0 };
    const o = row as Record<string, unknown>;
    return {
      productId: typeof o.productId === "string" ? o.productId : "",
      quantity: typeof o.quantity === "number" ? o.quantity : Number(o.quantity),
    };
  });

  try {
    const order = await checkoutOrder(userId, {
      phone,
      shippingAddress,
      items,
    });
    res.status(201).json({ order });
  } catch (e) {
    if (e instanceof CheckoutError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
