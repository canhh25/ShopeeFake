import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRoleFromToken, TOKEN_STORAGE_KEY } from "../lib/authApi";
import {
  fetchAdminUsers,
  toggleUserBlockApi,
  type AdminUserRow,
} from "../lib/adminUsersApi";

function cellText(v: string | null): string {
  if (v === null || v.trim() === "") return "—";
  return v;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchAdminUsers();
      setUsers(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lỗi tải danh sách";
      if (msg === "UNAUTHORIZED") {
        navigate("/login", { replace: true, state: { from: "/admin/users" } });
        return;
      }
      if (msg === "FORBIDDEN") {
        navigate("/", { replace: true });
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      navigate("/login", { replace: true, state: { from: "/admin/users" } });
      return;
    }
    if (getRoleFromToken() !== "ADMIN") {
      navigate("/", { replace: true });
      return;
    }
    void load();
  }, [load, navigate]);

  async function handleToggle(u: AdminUserRow) {
    setTogglingId(u.id);
    try {
      const updated = await toggleUserBlockApi(u.id);
      setUsers((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Thao tác thất bại";
      if (msg === "UNAUTHORIZED") {
        navigate("/login", { replace: true, state: { from: "/admin/users" } });
        return;
      }
      if (msg === "FORBIDDEN") {
        navigate("/", { replace: true });
        return;
      }
      alert(msg);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Quản lý khách hàng
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Danh sách tài khoản, số điện thoại và địa chỉ giao hàng.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products"
            className="text-sm font-medium text-text-primary underline-offset-2 hover:underline"
          >
            Sản phẩm
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-text-primary underline-offset-2 hover:underline"
          >
            ← Trang chủ
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg shadow-text-primary/5">
        {loading && (
          <p className="p-8 text-sm text-text-secondary">Đang tải…</p>
        )}
        {error && !loading && (
          <p className="p-8 text-sm text-text-primary">
            <span className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
              {error}
            </span>
          </p>
        )}
        {!loading && !error && users.length === 0 && (
          <p className="p-8 text-sm text-text-secondary">Chưa có người dùng.</p>
        )}
        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/25 text-xs uppercase tracking-wide text-text-secondary">
                  <th className="px-4 py-3.5 font-semibold">Email</th>
                  <th className="px-4 py-3.5 font-semibold">Họ tên</th>
                  <th className="px-4 py-3.5 font-semibold">Điện thoại</th>
                  <th className="min-w-[200px] px-4 py-3.5 font-semibold">
                    Địa chỉ giao hàng
                  </th>
                  <th className="px-4 py-3.5 font-semibold">Vai trò</th>
                  <th className="px-4 py-3.5 font-semibold">Đăng ký</th>
                  <th className="px-4 py-3.5 text-right font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={
                      u.isBlocked
                        ? "bg-text-secondary/[0.06] text-rose-800/90"
                        : "text-text-primary hover:bg-primary/10"
                    }
                  >
                    <td className="px-4 py-3 align-top font-medium">{u.email}</td>
                    <td className="px-4 py-3 align-top">{cellText(u.name)}</td>
                    <td className="px-4 py-3 align-top tabular-nums">
                      {cellText(u.phone)}
                    </td>
                    <td className="max-w-[280px] px-4 py-3 align-top text-text-secondary">
                      <span
                        className={
                          u.isBlocked ? "line-clamp-3" : "line-clamp-3 text-text-primary/90"
                        }
                      >
                        {cellText(u.shippingAddress)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={
                          u.role === "ADMIN"
                            ? "rounded-full bg-accent/50 px-2.5 py-0.5 text-xs font-semibold text-text-primary ring-1 ring-border"
                            : "rounded-full bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-text-primary ring-1 ring-border"
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-text-secondary">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        type="button"
                        disabled={togglingId === u.id}
                        onClick={() => void handleToggle(u)}
                        className={
                          u.isBlocked
                            ? "rounded-xl border border-border bg-primary/40 px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-primary/60 disabled:opacity-50"
                            : "rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-secondary/70 disabled:opacity-50"
                        }
                      >
                        {togglingId === u.id
                          ? "…"
                          : u.isBlocked
                            ? "Bỏ chặn"
                            : "Chặn"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
