import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useBlockedFromProfile } from "../hooks/useBlockedFromProfile";
import {
  getRoleFromToken,
  subscribeAuthChanged,
  TOKEN_STORAGE_KEY,
} from "../lib/authApi";
import {
  fetchCatalogProducts,
  type CatalogProduct,
} from "../lib/catalogApi";

type Health = { ok: boolean; database: string };

const toastPastel = {
  style: {
    background: "#FDFDFD",
    border: "1px solid #EEEEEE",
    color: "#424242",
  },
};

export default function Home() {
  const { addItem } = useCart();
  const { isBlocked, loading: blockLoading } = useBlockedFromProfile();
  const [health, setHealth] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [productsErr, setProductsErr] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setHasToken(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
      setIsAdmin(getRoleFromToken() === "ADMIN");
    };
    sync();
    const unsub = subscribeAuthChanged(sync);
    return unsub;
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: Health) => setHealth(data))
      .catch(() => setErr("Không kết nối được API (chạy backend trên port 3001)."));
  }, []);

  useEffect(() => {
    fetchCatalogProducts()
      .then(setProducts)
      .catch(() => setProductsErr("Không tải được sản phẩm."));
  }, []);

  const cartDisabled = hasToken && isBlocked;
  const cartDisabledReason =
    "Tài khoản của bạn đang bị tạm khóa — không thể thêm sản phẩm vào giỏ hàng. Vui lòng liên hệ hỗ trợ.";

  function handleAddToCart(p: CatalogProduct) {
    if (cartDisabled) {
      toast.error(cartDisabledReason, { ...toastPastel, duration: 5000 });
      return;
    }
    if (p.stock < 1) {
      toast.error("Sản phẩm đã hết hàng.", toastPastel);
      return;
    }
    addItem(
      {
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
      },
      1,
      p.stock
    );
    toast.success("Đã thêm thành công", {
      ...toastPastel,
      style: {
        ...toastPastel.style,
        borderLeft: "4px solid #B2DFDB",
      },
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {hasToken && (
            <>
              <Link
                to="/profile"
                className="rounded-lg border border-border bg-primary/50 px-4 py-2 text-sm font-semibold text-text-primary shadow-sm backdrop-blur transition hover:bg-primary/70"
              >
                Hồ sơ
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    className="rounded-lg border border-border bg-accent/50 px-4 py-2 text-sm font-semibold text-text-primary shadow-sm backdrop-blur transition hover:bg-accent/70"
                  >
                    Khách hàng
                  </Link>
                  <Link
                    to="/admin/products"
                    className="rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold text-text-primary shadow-sm backdrop-blur transition hover:bg-secondary/60"
                  >
                    Sản phẩm
                  </Link>
                </>
              )}
            </>
          )}
          <Link
            to="/login"
            className="rounded-lg border border-border bg-white/80 px-4 py-2 text-sm font-medium text-text-primary shadow-sm backdrop-blur transition hover:bg-white"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-text-primary shadow-md ring-1 ring-border transition hover:bg-accent/90"
          >
            Đăng ký
          </Link>
        </div>
        {hasToken && (
          <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-text-primary ring-1 ring-border">
            Đã đăng nhập
          </span>
        )}
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight text-text-primary">
        ShopeeFake
      </h1>
      <p className="mb-6 text-lg text-text-secondary">
        Cửa hàng mẫu — pastel mint &amp; pink.
      </p>

      {hasToken && isBlocked && (
        <div
          className="mb-8 rounded-2xl border border-border bg-secondary/45 px-4 py-3 text-sm text-text-primary shadow-sm"
          role="status"
        >
          {cartDisabledReason}
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Sản phẩm nổi bật
        </h2>
        {productsErr && (
          <p className="text-sm text-text-secondary">{productsErr}</p>
        )}
        {!productsErr && products.length === 0 && (
          <p className="text-sm text-text-secondary">Đang tải hoặc chưa có sản phẩm.</p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-lg shadow-text-primary/5"
            >
              <div className="aspect-[4/3] border-b border-border bg-background">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-secondary">
                    —
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-text-primary line-clamp-2">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                    {p.description}
                  </p>
                )}
                <p className="mt-2 text-lg font-bold text-text-primary">
                  {p.price.toLocaleString("vi-VN")} ₫
                </p>
                <p className="text-xs text-text-secondary">
                  Còn {p.stock} sản phẩm
                </p>
                <div className="mt-4 flex flex-1 flex-col justify-end gap-2">
                  <button
                    type="button"
                    disabled={
                      cartDisabled ||
                      (hasToken && blockLoading) ||
                      p.stock < 1
                    }
                    onClick={() => handleAddToCart(p)}
                    title={
                      cartDisabled
                        ? cartDisabledReason
                        : p.stock < 1
                          ? "Hết hàng"
                          : undefined
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-text-primary shadow-md shadow-accent/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {p.stock < 1
                      ? "Hết hàng"
                      : cartDisabled
                        ? "Không thể thêm"
                        : "Thêm vào giỏ"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-lg shadow-text-primary/5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">
          Trạng thái API &amp; Database
        </h2>
        {err && (
          <p className="text-sm text-text-primary">
            <span className="rounded-md border border-border bg-secondary/40 px-2 py-0.5">
              {err}
            </span>
          </p>
        )}
        {health && !err && (
          <p className="text-text-primary">
            API:{" "}
            <span className="font-medium text-primary">
              {health.ok ? "OK" : "Lỗi"}
            </span>{" "}
            — Database:{" "}
            <strong className="text-text-primary">{health.database}</strong>
          </p>
        )}
      </section>
    </main>
  );
}
