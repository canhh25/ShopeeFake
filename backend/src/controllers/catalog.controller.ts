import type { RequestHandler } from "express";
import { listProducts } from "../services/product.service.js";

export const listPublicProducts: RequestHandler = async (_req, res) => {
  try {
    const products = await listProducts();
    res.json({ products });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
