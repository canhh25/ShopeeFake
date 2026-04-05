import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { TOKEN_STORAGE_KEY } from "../lib/authApi";
import { checkoutRequest } from "../lib/ordersApi";
import { fetchProfile } from "../lib/profileApi";

const toastPastel = {
  style: {
    background: "#FDFDFD",
    border: "1px solid #EEEEEE",
    color: "#424242",
  },
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none ring-accent/25 focus:border-accent focus:bg-white focus:ring-4";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      navigate("/login", { replace: true, state: { from: "/checkout" } });
      return;
    }
    if (items.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }

    let cancelled = false;
    fetchProfile()
      .then((p) => {
        if (cancelled) return;
        setName(p.name ?? "");
        setPhone(p.phone ?? "");
        setShippingAddress(p.shippingAddress ?? "");
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Không tải được hồ sơ. Vui lòng nhập tay thông tin giao hàng.", toastPastel);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items.length, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = phone.trim();
    const addr = shippingAddress.trim();
    if (!p || !addr) {
      toast.error("Vui lòng nhập đủ số điện thoại và địa chỉ giao hàng.", toastPastel);
      return;
    }

    setSubmitting(true);
    try {
      const order = await checkoutRequest({
        phone: p,
        shippingAddress: addr,
        items: items.map((it) => ({
          productId: it.id,
          quantity: it.quantity,
        })),
      });
      clearCart();
      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.", {
        ...toastPastel,
        style: {
          ...toastPastel.style,
          borderLeft: "4px solid #B2DFDB",
        },
      });
      navigate(
        `/orders/thank-you?orderId=${encodeURIComponent(order.id)}&total=${encodeURIComponent(String(order.totalAmount))}`,
        { replace: true }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đặt hàng thất bại";
      if (msg === "UNAUTHORIZED") {
        navigate("/login", { replace: true, state: { from: "/checkout" } });
        return;
      }
      toast.error(msg, { ...toastPastel, duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  }

  const formattedTotal = totalPrice.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Thanh toán</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Kiểm tra thông tin giao hàng và xác nhận đơn hàng.
          </p>
        </div>
        <Link
          to="/cart"
          className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:bg-primary/20"
        >
          ← Về giỏ hàng
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-lg shadow-text-primary/5 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Thông tin giao hàng
          </h2>
          {loadingProfile && (
            <p className="mb-4 text-sm text-text-secondary">Đang tải hồ sơ…</p>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="co-name"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Họ tên (tham khảo)
              </label>
              <input
                id="co-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
              <p className="mt-1 text-xs text-text-secondary">
                Tên chỉ hiển thị trên đơn nội bộ; có thể cập nhật trong Hồ sơ.
              </p>
            </div>
            <div>
              <label
                htmlFor="co-phone"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Số điện thoại <span className="text-rose-700/80">*</span>
              </label>
              <input
                id="co-phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="0xxx xxx xxx"
                autoComplete="tel"
              />
            </div>
            <div>
              <label
                htmlFor="co-address"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Địa chỉ giao hàng <span className="text-rose-700/80">*</span>
              </label>
              <textarea
                id="co-address"
                required
                rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                autoComplete="street-address"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/40 bg-primary/25 p-6 shadow-lg shadow-text-primary/5 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Tóm tắt đơn hàng
          </h2>
          <ul className="mb-6 max-h-64 space-y-3 overflow-y-auto">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex justify-between gap-3 border-b border-border/60 pb-3 text-sm last:border-0"
              >
                <span className="text-text-primary">
                  <span className="font-medium">{it.name}</span>
                  <span className="text-text-secondary"> × {it.quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums text-text-primary">
                  {(it.price * it.quantity).toLocaleString("vi-VN")} ₫
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-lg font-semibold text-text-primary">
              Tổng thanh toán
            </span>
            <span className="text-xl font-bold tabular-nums text-text-primary">
              {formattedTotal}
            </span>
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            Giá áp dụng theo giá niêm yết tại thời điểm đặt hàng (đã kiểm tra tồn kho).
          </p>
          <button
            type="submit"
            disabled={submitting || loadingProfile}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-text-primary shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Đang xử lý…" : "Xác nhận đặt hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
