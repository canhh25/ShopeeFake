import type { RequestHandler } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  isDeleteBlockedByRelation,
  isRecordNotFoundError,
  listProducts,
  updateProduct,
} from "../services/product.service.js";

function routeId(req: { params: Record<string, string | string[] | undefined> }): string | undefined {
  const v = req.params.id;
  if (typeof v === "string" && v) return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

function parseString(body: unknown, key: string): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const v = (body as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}

function parseBody(body: unknown): {
  name: string;
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
} | { error: string } {
  const nameRaw = parseString(body, "name");
  if (!nameRaw || nameRaw.trim() === "") {
    return { error: "Tên sản phẩm là bắt buộc" };
  }

  if (!body || typeof body !== "object") {
    return { error: "Dữ liệu không hợp lệ" };
  }
  const o = body as Record<string, unknown>;

  const priceNum =
    typeof o.price === "number"
      ? o.price
      : typeof o.price === "string"
        ? Number(o.price)
        : NaN;
  if (!Number.isFinite(priceNum)) {
    return { error: "Giá phải là số hợp lệ" };
  }
  if (priceNum < 0) {
    return { error: "Giá không được âm" };
  }

  const stockNum =
    typeof o.stock === "number"
      ? o.stock
      : typeof o.stock === "string"
        ? Number(o.stock)
        : NaN;
  if (!Number.isFinite(stockNum) || !Number.isInteger(stockNum)) {
    return { error: "Số lượng tồn kho phải là số nguyên" };
  }
  if (stockNum < 0) {
    return { error: "Số lượng tồn kho không được âm" };
  }

  const descRaw = parseString(body, "description");
  const description =
    descRaw !== undefined && descRaw.trim() !== "" ? descRaw.trim() : null;

  const imgRaw = parseString(body, "imageUrl");
  const imageUrl =
    imgRaw !== undefined && imgRaw.trim() !== "" ? imgRaw.trim() : null;

  return {
    name: nameRaw.trim(),
    price: priceNum,
    stock: stockNum,
    description,
    imageUrl,
  };
}

export const list: RequestHandler = async (_req, res) => {
  try {
    const products = await listProducts();
    res.json({ products });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const getOne: RequestHandler = async (req, res) => {
  const id = routeId(req);
  if (!id) {
    res.status(400).json({ error: "Thiếu mã sản phẩm" });
    return;
  }
  try {
    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      return;
    }
    res.json({ product });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const create: RequestHandler = async (req, res) => {
  const parsed = parseBody(req.body);
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const product = await createProduct(parsed);
    res.status(201).json({ product });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const update: RequestHandler = async (req, res) => {
  const id = routeId(req);
  if (!id) {
    res.status(400).json({ error: "Thiếu mã sản phẩm" });
    return;
  }
  const parsed = parseBody(req.body);
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const product = await updateProduct(id, parsed);
    res.json({ product });
  } catch (e) {
    if (isRecordNotFoundError(e)) {
      res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const remove: RequestHandler = async (req, res) => {
  const id = routeId(req);
  if (!id) {
    res.status(400).json({ error: "Thiếu mã sản phẩm" });
    return;
  }
  try {
    await deleteProduct(id);
    res.status(204).send();
  } catch (e) {
    if (isRecordNotFoundError(e)) {
      res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      return;
    }
    if (isDeleteBlockedByRelation(e)) {
      res.status(409).json({
        error: "Không thể xóa sản phẩm đã có trong đơn hàng",
      });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
