import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  loginRequest,
  notifyAuthChanged,
  TOKEN_STORAGE_KEY,
} from "../lib/authApi";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none ring-accent/25 transition placeholder:text-text-secondary focus:border-accent focus:bg-white focus:ring-4";

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
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">
            Đăng nhập
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Chào mừng trở lại ShopeeFake
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-xl shadow-text-primary/10">
          {successMsg && (
            <div
              className="mb-4 rounded-xl border border-border bg-primary/40 px-4 py-3 text-sm text-text-primary"
              role="status"
            >
              {successMsg}
            </div>
          )}
          {error && (
            <div
              className="mb-4 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-text-primary"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-text-primary"
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
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-text-primary"
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
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-text-primary shadow-lg shadow-accent/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang xử lý…" : "Đăng nhập"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-text-primary underline-offset-2 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
