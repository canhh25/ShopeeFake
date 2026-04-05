import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TOKEN_STORAGE_KEY } from "../lib/authApi";
import {
  createProductApi,
  deleteProductApi,
  fetchProducts,
  updateProductApi,
  type Product,
} from "../lib/productsApi";

const emptyForm = {
  name: "",
  price: "",
  stock: "",
  description: "",
  imageUrl: "",
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    try {
      const list = await fetchProducts();
      setProducts(list);
    } catch (e) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") {
        navigate("/login", { replace: true, state: { from: "/admin/products" } });
        return;
      }
      setListError(e instanceof Error ? e.message : "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      navigate("/login", { replace: true, state: { from: "/admin/products" } });
      return;
    }
    void load();
  }, [load, navigate]);

  function validateForm(): string | null {
    if (!form.name.trim()) return "Tên sản phẩm là bắt buộc";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) return "Giá không được âm và phải là số hợp lệ";
    const stock = Number(form.stock);
    if (!Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0) {
      return "Số lượng tồn kho phải là số nguyên không âm";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const v = validateForm();
    if (v) {
      setFormError(v);
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stock);
    const payload = {
      name: form.name.trim(),
      price,
      stock,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };
    setSaving(true);
    try {
      if (editingId) {
        await updateProductApi(editingId, payload);
      } else {
        await createProductApi(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        navigate("/login", { replace: true, state: { from: "/admin/products" } });
        return;
      }
      setFormError(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setFormError(null);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      description: p.description ?? "",
      imageUrl: p.imageUrl ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProductApi(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">
            Quản lý sản phẩm
          </h1>
          <p className="mt-1 text-sm text-white/85">
            Thêm, sửa, xóa sản phẩm — cần đăng nhập.
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-medium text-white/95 underline-offset-2 hover:underline"
        >
          ← Về trang chủ
        </Link>
      </div>

      <section className="mb-10 rounded-2xl bg-white p-6 shadow-xl shadow-black/10 ring-1 ring-black/5 sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h2>
        {formError && (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tên
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-[#ee4d2d]/25 focus:border-[#ee4d2d] focus:bg-white focus:ring-4"
              placeholder="Tên sản phẩm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Giá
            </label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-[#ee4d2d]/25 focus:border-[#ee4d2d] focus:bg-white focus:ring-4"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Số lượng tồn kho
            </label>
            <input
              required
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-[#ee4d2d]/25 focus:border-[#ee4d2d] focus:bg-white focus:ring-4"
              placeholder="0"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-[#ee4d2d]/25 focus:border-[#ee4d2d] focus:bg-white focus:ring-4"
              placeholder="Mô tả ngắn gọn"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Link ảnh
            </label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-[#ee4d2d]/25 focus:border-[#ee4d2d] focus:bg-white focus:ring-4"
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-105 disabled:opacity-60"
            >
              {saving
                ? "Đang lưu…"
                : editingId
                  ? "Cập nhật"
                  : "Thêm sản phẩm"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-xl shadow-black/10 ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Danh sách sản phẩm
        </h2>
        {loading && (
          <p className="text-sm text-slate-600">Đang tải…</p>
        )}
        {listError && !loading && (
          <p className="text-sm text-red-600">{listError}</p>
        )}
        {!loading && !listError && products.length === 0 && (
          <p className="text-sm text-slate-600">Chưa có sản phẩm nào.</p>
        )}
        {!loading && !listError && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-3 font-medium">Ảnh</th>
                  <th className="pb-3 pr-3 font-medium">Tên</th>
                  <th className="pb-3 pr-3 font-medium">Giá</th>
                  <th className="pb-3 pr-3 font-medium">Tồn kho</th>
                  <th className="pb-3 pr-3 font-medium">Mô tả</th>
                  <th className="pb-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="align-middle">
                    <td className="py-3 pr-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-medium text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 pr-3 tabular-nums text-slate-700">
                      {p.price.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="py-3 pr-3 tabular-nums text-slate-700">
                      {p.stock}
                    </td>
                    <td className="max-w-[200px] truncate py-3 pr-3 text-slate-600">
                      {p.description ?? "—"}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10">
            <h3
              id="delete-dialog-title"
              className="text-lg font-semibold text-slate-900"
            >
              Xác nhận xóa
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa?
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {deleteTarget.name}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Đang xóa…" : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
