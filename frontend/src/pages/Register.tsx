import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../lib/authApi";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none ring-accent/25 transition placeholder:text-text-secondary focus:border-accent focus:bg-white focus:ring-4";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerRequest({ email, password, name });
      navigate("/login", { replace: true, state: { registered: true } });
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
            Tạo tài khoản
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Tham gia ShopeeFake trong vài giây
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-xl shadow-text-primary/10">
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
                htmlFor="reg-name"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Họ tên
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label
                htmlFor="reg-email"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Email
              </label>
              <input
                id="reg-email"
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
                htmlFor="reg-password"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Mật khẩu
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-text-primary shadow-lg shadow-accent/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang tạo tài khoản…" : "Đăng ký"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-semibold text-text-primary underline-offset-2 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
