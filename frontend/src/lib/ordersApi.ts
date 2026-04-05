import { TOKEN_STORAGE_KEY } from "./authApi";

export type CheckoutLine = {
  productId: string;
  quantity: number;
};

export type CheckoutOrderResponse = {
  order: {
    id: string;
    userId: string;
    totalAmount: number;
    status: string;
    phone: string | null;
    shippingAddress: string | null;
    createdAt: string;
    updatedAt: string;
    orderItems: Array<{
      id: string;
      orderId: string;
      productId: string;
      quantity: number;
      priceAtPurchase: number;
      product: { id: string; name: string };
    }>;
  };
};

function authJsonHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error || "Đặt hàng thất bại";
}

export async function checkoutRequest(body: {
  phone: string;
  shippingAddress: string;
  items: CheckoutLine[];
}): Promise<CheckoutOrderResponse["order"]> {
  const res = await fetch("/api/orders/checkout", {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as CheckoutOrderResponse;
  return data.order;
}
