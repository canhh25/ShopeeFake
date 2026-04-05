import { TOKEN_STORAGE_KEY } from "./authApi";

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  shippingAddress: string | null;
  createdAt: string;
  updatedAt: string;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function authJsonHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error || "Yêu cầu thất bại";
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch("/api/profile", { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { profile: UserProfile };
  return data.profile;
}

export type ProfileUpdate = {
  name: string;
  phone: string;
  shippingAddress: string;
};

export async function updateProfileApi(
  body: ProfileUpdate
): Promise<UserProfile> {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { profile: UserProfile };
  return data.profile;
}
