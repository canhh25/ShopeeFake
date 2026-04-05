import { TOKEN_STORAGE_KEY } from "./authApi";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  shippingAddress: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error || "Yêu cầu thất bại";
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const res = await fetch("/api/admin/users", { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { users: AdminUserRow[] };
  return data.users;
}

export async function toggleUserBlockApi(
  userId: string
): Promise<AdminUserRow> {
  const res = await fetch(
    `/api/admin/users/${encodeURIComponent(userId)}/toggle-block`,
    { method: "PATCH", headers: authHeaders() }
  );
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { user: AdminUserRow };
  return data.user;
}
