import { useEffect, useState } from "react";
import { subscribeAuthChanged, TOKEN_STORAGE_KEY } from "../lib/authApi";

/**
 * Đồng bộ trạng thái chặn tài khoản từ API (kể cả khi bị chặn giữa phiên).
 * Không có token → không coi là bị chặn (khách vẫn dùng giỏ).
 */
export function useBlockedFromProfile() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        if (!cancelled) {
          setIsBlocked(false);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          if (!cancelled) {
            setIsBlocked(true);
            setLoading(false);
          }
          return;
        }

        if (!res.ok) {
          if (!cancelled) {
            setIsBlocked(false);
            setLoading(false);
          }
          return;
        }

        const data = (await res.json()) as {
          profile?: { isBlocked?: boolean };
        };
        if (!cancelled) {
          setIsBlocked(Boolean(data.profile?.isBlocked));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsBlocked(false);
          setLoading(false);
        }
      }
    }

    void run();
    const unsub = subscribeAuthChanged(() => void run());
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { isBlocked, loading };
}
