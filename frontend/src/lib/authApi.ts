const jsonHeaders = { "Content-Type": "application/json" };

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
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

const AUTH_CHANGE_EVENT = "shopeefake-auth-change";

export function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function subscribeAuthChanged(cb: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, cb);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, cb);
}
