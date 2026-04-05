const jsonHeaders = { "Content-Type": "application/json" };

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export async function registerRequest(body: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: AuthUser & { createdAt?: string } }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; user?: unknown };
  if (!res.ok) {
    throw new Error(data.error || "Đăng ký thất bại");
  }
  return data as { user: AuthUser & { createdAt?: string } };
}

export async function loginRequest(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    token?: string;
    user?: AuthUser;
  };
  if (!res.ok) {
    throw new Error(data.error || "Đăng nhập thất bại");
  }
  if (!data.token || !data.user) {
    throw new Error("Phản hồi không hợp lệ từ máy chủ");
  }
  return { token: data.token, user: data.user };
}

export const TOKEN_STORAGE_KEY = "token";

/** Đọc role từ JWT (payload, không verify — chỉ để hiển thị menu). */
export function getRoleFromToken(): string | null {
  const t = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!t) return null;
  const parts = t.split(".");
  if (parts.length !== 3) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const json = atob(base64);
    const payload = JSON.parse(json) as { role?: string };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

const AUTH_CHANGE_EVENT = "shopeefake-auth-change";

export function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function subscribeAuthChanged(cb: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, cb);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, cb);
}
