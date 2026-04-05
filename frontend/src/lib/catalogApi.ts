export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  const res = await fetch("/api/catalog/products");
  if (!res.ok) throw new Error("Không tải được danh sách sản phẩm");
  const data = (await res.json()) as { products: CatalogProduct[] };
  return data.products;
}
