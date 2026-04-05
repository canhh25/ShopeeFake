import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { subscribeAuthChanged, TOKEN_STORAGE_KEY } from "./lib/authApi";
import AdminProducts from "./pages/AdminProducts";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function useHasToken() {
  const [hasToken, setHasToken] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))
  );
  useEffect(() => {
    const sync = () =>
      setHasToken(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
    const unsub = subscribeAuthChanged(sync);
    window.addEventListener("focus", sync);
    return () => {
      unsub();
      window.removeEventListener("focus", sync);
    };
  }, []);
  return hasToken;
}

function AppShell({ children }: { children: ReactNode }) {
  const hasToken = useHasToken();
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/50 via-background to-secondary/40">
      <header className="border-b border-border bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-text-primary drop-shadow-sm"
          >
            Shopee<span className="font-black text-accent">Fake</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
            {hasToken && (
              <Link
                to="/admin/products"
                className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-secondary/60"
              >
                Quản lý sản phẩm
              </Link>
            )}
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-primary/40"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-border transition hover:bg-accent/90"
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
