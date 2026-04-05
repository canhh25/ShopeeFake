import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeAuthChanged, TOKEN_STORAGE_KEY } from "../lib/authApi";

type Health = { ok: boolean; database: string };

export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const sync = () =>
      setHasToken(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
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

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {hasToken && (
            <Link
              to="/admin/products"
              className="rounded-lg border border-border bg-primary/50 px-4 py-2 text-sm font-semibold text-text-primary shadow-sm backdrop-blur transition hover:bg-primary/70"
            >
              Quản lý sản phẩm
            </Link>
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

      <h1 className="mb-2 text-4xl font-bold tracking-tight text-text-primary drop-shadow-sm">
        Hello World
      </h1>
      <p className="mb-8 text-lg text-text-secondary">
        ShopeeFake — frontend đã chạy trên localhost.
      </p>

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
