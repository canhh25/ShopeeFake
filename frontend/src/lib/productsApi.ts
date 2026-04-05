import { TOKEN_STORAGE_KEY } from "./authApi";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function authJsonHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error || "Yêu cầu thất bại";
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { products: Product[] };
  return data.products;
}

export async function createProductApi(
  body: ProductInput
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { product: Product };
  return data.product;
}

export async function updateProductApi(
  id: string,
  body: ProductInput
): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { product: Product };
  return data.product;
}

export async function deleteProductApi(id: string): Promise<void> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 404) throw new Error(await parseError(res));
  if (res.status === 409) throw new Error(await parseError(res));
  if (!res.ok) throw new Error(await parseError(res));
}
