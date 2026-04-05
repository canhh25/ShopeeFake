import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchCatalogProducts } from "../lib/catalogApi";
import { subscribeAuthChanged, TOKEN_STORAGE_KEY } from "../lib/authApi";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export default function Cart() {
  const { items, removeItem, increment, decrement, totalPrice, totalQuantity } =
    useCart();
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [hasToken, setHasToken] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))
  );

  useEffect(() => {
    const sync = () =>
      setHasToken(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
    sync();
    return subscribeAuthChanged(sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogProducts()
      .then((list) => {
        if (cancelled) return;
        const m: Record<string, number> = {};
        for (const p of list) m[p.id] = p.stock;
        setStocks(m);
      })
      .catch(() => {
        if (!cancelled) setStocks({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stockOf = (id: string) => stocks[id];

  const formattedTotal = useMemo(
    () =>
      totalPrice.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    [totalPrice]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Giỏ hàng</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {totalQuantity > 0
              ? `${totalQuantity} sản phẩm trong giỏ`
              : "Giỏ hàng trống"}
          </p>
        </div>
        <Link
          to="/"
          className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:bg-primary/20"
        >
          ← Tiếp tục mua sắm
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-lg shadow-text-primary/5">
          <p className="text-text-secondary">Chưa có sản phẩm nào.</p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-text-primary shadow-md"
          >
            Về trang chủ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {items.map((it) => {
              const max = stockOf(it.id);
              const maxStock = max !== undefined ? max : undefined;
              const lineTotal = it.price * it.quantity;
              return (
                <li
                  key={it.id}
                  className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-md shadow-text-primary/5"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-primary">{it.name}</p>
                    <p className="mt-0.5 text-sm text-text-secondary">
                      {it.price.toLocaleString("vi-VN")} ₫ / sản phẩm
                    </p>
                    {maxStock !== undefined && maxStock < it.quantity && (
                      <p className="mt-1 text-xs text-rose-700/80">
                        Tồn kho hiện tại: {maxStock}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
                        <button
                          type="button"
                          aria-label="Giảm"
                          onClick={() => decrement(it.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg font-medium text-text-primary shadow-sm transition hover:bg-primary/30"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-text-primary">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Tăng"
                          disabled={
                            maxStock !== undefined && it.quantity >= maxStock
                          }
                          onClick={() => increment(it.id, maxStock)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg font-medium text-text-primary shadow-sm transition hover:bg-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-secondary/60"
                        aria-label="Xóa khỏi giỏ"
                      >
                        <TrashIcon />
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums text-text-primary">
                      {lineTotal.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="rounded-2xl border border-border bg-primary/20 p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold text-text-primary">
                Tổng cộng
              </span>
              <span className="text-xl font-bold tabular-nums text-text-primary">
                {formattedTotal}
              </span>
            </div>
            {hasToken ? (
              <Link
                to="/checkout"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-text-primary shadow-lg shadow-accent/25 transition hover:opacity-90"
              >
                Thanh toán
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: "/checkout" }}
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-border bg-white py-3.5 text-sm font-semibold text-text-primary transition hover:bg-background"
              >
                Đăng nhập để thanh toán
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
