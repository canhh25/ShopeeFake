import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAdminStats, type DashboardStats } from "../lib/adminStatsApi";

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-secondary/60",
  PROCESSING: "bg-accent/60",
  SHIPPED: "bg-primary/60",
  DONE: "bg-primary",
  CANCELLED: "bg-border",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Lỗi";
        if (msg === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }
        if (msg === "FORBIDDEN") {
          navigate("/", { replace: true });
          return;
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <p className="mb-8 text-sm text-text-secondary">Đang tải thống kê…</p>
    );
  }

  if (error) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm text-text-primary">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const totalOrders = Object.values(stats.ordersByStatus).reduce(
    (s, n) => s + n,
    0
  );

  const chartData = stats.revenueByDay.map((r) => ({
    ...r,
    label: formatDateShort(r.date),
  }));

  return (
    <div className="mb-10 space-y-6">
      <h2 className="text-xl font-bold text-text-primary">Tổng quan</h2>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-md shadow-text-primary/5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Tổng doanh thu
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
            {formatVND(stats.totalRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-md shadow-text-primary/5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Tổng đơn hàng
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
            {totalOrders}
          </p>
        </div>

        {Object.entries(stats.ordersByStatus).map(([status, count]) => (
          <div
            key={status}
            className="rounded-2xl border border-border bg-white p-5 shadow-md shadow-text-primary/5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              {STATUS_LABEL[status] ?? status}
            </p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-2xl font-bold tabular-nums text-text-primary">
                {count}
              </p>
              <span
                className={`mb-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-text-primary ${STATUS_COLOR[status] ?? "bg-border"}`}
              >
                đơn
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ + Top sản phẩm */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-5 shadow-md shadow-text-primary/5">
          <p className="mb-4 text-sm font-semibold text-text-primary">
            Doanh thu 30 ngày gần nhất
          </p>
          {chartData.length === 0 ? (
            <p className="text-sm text-text-secondary">Chưa có dữ liệu.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b2dfdb" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#b2dfdb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#757575" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#757575" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}tr`
                      : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}k`
                        : String(v)
                  }
                />
                <Tooltip
                  formatter={(v: number) => [formatVND(v), "Doanh thu"]}
                  labelFormatter={(l) => `Ngày ${l}`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #EEEEEE",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b2dfdb"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-md shadow-text-primary/5">
          <p className="mb-4 text-sm font-semibold text-text-primary">
            Top sản phẩm bán chạy
          </p>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-text-secondary">Chưa có dữ liệu.</p>
          ) : (
            <ol className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/50 text-xs font-bold text-text-primary">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                    {p.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-secondary/50 px-2 py-0.5 text-xs font-semibold tabular-nums text-text-primary ring-1 ring-border">
                    {p.totalSold}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}