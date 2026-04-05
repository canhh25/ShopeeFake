import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TOKEN_STORAGE_KEY } from "../lib/authApi";
import {
  fetchProfile,
  updateProfileApi,
  type UserProfile,
} from "../lib/profileApi";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none ring-accent/25 focus:border-accent focus:bg-white focus:ring-4";

function displayValue(v: string | null): string {
  if (v === null || v.trim() === "") return "Chưa cập nhật";
  return v;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", shippingAddress: "" });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const p = await fetchProfile();
      setProfile(p);
      setForm({
        name: p.name ?? "",
        phone: p.phone ?? "",
        shippingAddress: p.shippingAddress ?? "",
      });
    } catch (e) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") {
        navigate("/login", { replace: true, state: { from: "/profile" } });
        return;
      }
      setLoadError(e instanceof Error ? e.message : "Không tải được hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      navigate("/login", { replace: true, state: { from: "/profile" } });
      return;
    }
    void load();
  }, [load, navigate]);

  function startEdit() {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      shippingAddress: profile.shippingAddress ?? "",
    });
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        shippingAddress: profile.shippingAddress ?? "",
      });
    }
    setSaveError(null);
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await updateProfileApi({
        name: form.name.trim(),
        phone: form.phone.trim(),
        shippingAddress: form.shippingAddress.trim(),
      });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        navigate("/login", { replace: true, state: { from: "/profile" } });
        return;
      }
      setSaveError(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Thông tin cá nhân
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Cập nhật họ tên, điện thoại và địa chỉ giao hàng.
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-medium text-text-primary underline-offset-2 hover:underline"
        >
          ← Về trang chủ
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-lg shadow-text-primary/5 sm:p-8">
        {loading && (
          <p className="text-sm text-text-secondary">Đang tải…</p>
        )}
        {loadError && !loading && (
          <p className="text-sm text-text-primary">
            <span className="rounded-md border border-border bg-secondary/40 px-2 py-1">
              {loadError}
            </span>
          </p>
        )}

        {!loading && !loadError && profile && !editing && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Email
              </p>
              <p className="mt-1 text-text-primary">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Vai trò
              </p>
              <p className="mt-1 text-text-primary">{profile.role}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Họ tên
              </p>
              <p className="mt-1 text-text-primary">
                {displayValue(profile.name)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Số điện thoại
              </p>
              <p className="mt-1 text-text-primary">
                {displayValue(profile.phone)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Địa chỉ giao hàng
              </p>
              <p className="mt-1 whitespace-pre-wrap text-text-primary">
                {displayValue(profile.shippingAddress)}
              </p>
            </div>
            <button
              type="button"
              onClick={startEdit}
              className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-text-primary shadow-lg shadow-accent/25 transition hover:opacity-90"
            >
              Chỉnh sửa
            </button>
          </div>
        )}

        {!loading && !loadError && profile && editing && (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Email
              </p>
              <p className="mt-1 text-text-primary">{profile.email}</p>
              <p className="mt-1 text-xs text-text-secondary">
                Email không thể thay đổi tại đây.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Vai trò
              </p>
              <p className="mt-1 text-text-primary">{profile.role}</p>
            </div>
            {saveError && (
              <div
                className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-text-primary"
                role="alert"
              >
                {saveError}
              </div>
            )}
            <div>
              <label
                htmlFor="profile-name"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Họ tên
              </label>
              <input
                id="profile-name"
                autoComplete="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={inputClass}
                placeholder="Họ và tên"
              />
            </div>
            <div>
              <label
                htmlFor="profile-phone"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Số điện thoại
              </label>
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className={inputClass}
                placeholder="0xxx xxx xxx"
              />
            </div>
            <div>
              <label
                htmlFor="profile-address"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Địa chỉ giao hàng
              </label>
              <textarea
                id="profile-address"
                rows={4}
                autoComplete="street-address"
                value={form.shippingAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shippingAddress: e.target.value }))
                }
                className={`${inputClass} resize-y`}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-text-primary shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Đang lưu…" : "Lưu"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-text-primary hover:bg-primary/20 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
