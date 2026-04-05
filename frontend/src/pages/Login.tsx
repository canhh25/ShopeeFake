import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  loginRequest,
  notifyAuthChanged,
  TOKEN_STORAGE_KEY,
} from "../lib/authApi";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = Boolean(
    (location.state as { registered?: boolean } | null)?.registered
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (registered) {
      setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
    }
  }, [registered]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const { token } = await loginRequest({ email, password });
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      notifyAuthChanged();
      setSuccessMsg("Đăng nhập thành công!");
      window.setTimeout(() => navigate("/", { replace: true }), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">
            Đăng nhập
          </h1>
          <p className="mt-2 text-sm text-white/85">
            Chào mừng trở lại ShopeeFake
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/15 ring-1 ring-black/5">
          {successMsg && (
            <div
              className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              role="status"
            >
              {successMsg}
            </div>
          )}
          {error && (
            <div
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-[#ee4d2d]/30 transition placeholder:text-slate-400 focus:border-[#ee4d2d] focus:bg-white focus:ring-4"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Mật khẩu
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-[#ee4d2d]/30 transition focus:border-[#ee4d2d] focus:bg-white focus:ring-4"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang xử lý…" : "Đăng nhập"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#ee4d2d] hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
