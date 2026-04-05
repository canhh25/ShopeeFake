import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TOKEN_STORAGE_KEY } from "../lib/authApi";

type Health = { ok: boolean; database: string };

export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
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
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#ee4d2d] shadow-md transition hover:bg-orange-50"
          >
            Đăng ký
          </Link>
        </div>
        {hasToken && (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-emerald-400/40">
            Đã đăng nhập
          </span>
        )}
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight text-white drop-shadow-sm">
        Hello World
      </h1>
      <p className="mb-8 text-lg text-white/90">
        ShopeeFake — frontend đã chạy trên localhost.
      </p>

      <section className="rounded-2xl bg-white p-6 shadow-xl shadow-black/10 ring-1 ring-black/5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ee4d2d]">
          Trạng thái API &amp; Database
        </h2>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {health && !err && (
          <p className="text-slate-700">
            API:{" "}
            <span className="font-medium text-emerald-600">
              {health.ok ? "OK" : "Lỗi"}
            </span>{" "}
            — Database:{" "}
            <strong className="text-slate-900">{health.database}</strong>
          </p>
        )}
      </section>
    </main>
  );
}
