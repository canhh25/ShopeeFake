import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

const STORAGE_KEY = "shopeefake-cart-v1";

function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    Number.isFinite(o.price) &&
    typeof o.quantity === "number" &&
    Number.isInteger(o.quantity) &&
    o.quantity >= 1 &&
    (o.imageUrl === null || typeof o.imageUrl === "string")
  );
}

function loadStored(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

type CartContextValue = {
  items: CartItem[];
  addItem: (
    product: Pick<CartItem, "id" | "name" | "price" | "imageUrl">,
    quantity?: number,
    maxStock?: number
  ) => void;
  removeItem: (id: string) => void;
  increment: (id: string, maxStock?: number) => void;
  decrement: (id: string) => void;
  setQuantity: (id: string, quantity: number, maxStock?: number) => void;
  totalQuantity: number;
  totalPrice: number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadStored());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (
      product: Pick<CartItem, "id" | "name" | "price" | "imageUrl">,
      quantity = 1,
      maxStock?: number
    ) => {
      const add = Math.max(1, Math.floor(quantity));
      const cap =
        maxStock !== undefined && Number.isFinite(maxStock)
          ? Math.max(0, Math.floor(maxStock))
          : undefined;
      if (cap === 0) return;

      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === product.id);
        if (idx === -1) {
          const q =
            cap !== undefined ? Math.min(add, cap) : add;
          if (q < 1) return prev;
          return [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: q,
            },
          ];
        }
        const next = [...prev];
        const cur = next[idx];
        let newQty = cur.quantity + add;
        if (cap !== undefined) newQty = Math.min(newQty, cap);
        newQty = Math.max(1, newQty);
        next[idx] = { ...cur, quantity: newQty };
        return next;
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const increment = useCallback((id: string, maxStock?: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const cap =
          maxStock !== undefined && Number.isFinite(maxStock)
            ? Math.max(0, Math.floor(maxStock))
            : undefined;
        if (cap === 0) return it;
        let q = it.quantity + 1;
        if (cap !== undefined) q = Math.min(q, cap);
        return { ...it, quantity: q };
      })
    );
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((prev) => {
      const next: CartItem[] = [];
      for (const it of prev) {
        if (it.id !== id) {
          next.push(it);
          continue;
        }
        if (it.quantity <= 1) continue;
        next.push({ ...it, quantity: it.quantity - 1 });
      }
      return next;
    });
  }, []);

  const setQuantity = useCallback(
    (id: string, quantity: number, maxStock?: number) => {
      const q = Math.max(0, Math.floor(quantity));
      const cap =
        maxStock !== undefined && Number.isFinite(maxStock)
          ? Math.max(0, Math.floor(maxStock))
          : undefined;
      const finalQ = cap !== undefined ? Math.min(q, cap) : q;

      setItems((prev) => {
        if (finalQ < 1) return prev.filter((i) => i.id !== id);
        return prev.map((it) =>
          it.id === id ? { ...it, quantity: finalQ } : it
        );
      });
    },
    []
  );

  const { totalQuantity, totalPrice } = useMemo(() => {
    let qty = 0;
    let price = 0;
    for (const it of items) {
      qty += it.quantity;
      price += it.price * it.quantity;
    }
    return { totalQuantity: qty, totalPrice: price };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      increment,
      decrement,
      setQuantity,
      totalQuantity,
      totalPrice,
      clearCart,
    }),
    [
      items,
      addItem,
      removeItem,
      clearCart,
      increment,
      decrement,
      setQuantity,
      totalQuantity,
      totalPrice,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart phải dùng bên trong CartProvider");
  }
  return ctx;
}
