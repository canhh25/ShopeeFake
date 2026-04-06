import { TOKEN_STORAGE_KEY } from "./authApi";

export type DashboardStats = {
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  topProducts: { productId: string; name: string; totalSold: number }[];
  revenueByDay: { date: string; revenue: number }[];
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error || "Yêu cầu thất bại";
}

export async function fetchAdminStats(): Promise<DashboardStats> {
  const res = await fetch("/api/admin/stats", { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { stats: DashboardStats };
  return data.stats;
}