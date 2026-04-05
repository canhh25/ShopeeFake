import { Link, useSearchParams } from "react-router-dom";

export default function OrderThankYou() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const total = params.get("total");

  const formatted =
    total !== null && total !== ""
      ? Number(total).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })
      : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-xl shadow-text-primary/10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/50 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Cảm ơn bạn!</h1>
        <p className="mt-2 text-text-secondary">
          Đơn hàng của bạn đã được ghi nhận.
        </p>
        {orderId && (
          <p className="mt-4 rounded-xl bg-primary/20 px-4 py-2 text-sm text-text-primary">
            Mã đơn:{" "}
            <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}
        {formatted && (
          <p className="mt-2 text-lg font-semibold text-text-primary">
            Tổng tiền: {formatted}
          </p>
        )}
        <p className="mt-4 text-sm text-text-secondary">
          Giữ mã đơn để tra cứu. Trang &quot;Đơn hàng của tôi&quot; sẽ được bổ sung sau.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-text-primary shadow-md"
          >
            Về trang chủ
          </Link>
          <Link
            to="/cart"
            className="rounded-xl border border-border bg-white px-6 py-3 text-sm font-medium text-text-primary hover:bg-background"
          >
            Giỏ hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
