import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { useCart } from "./context/CartContext";
import {
  getRoleFromToken,
  subscribeAuthChanged,
  TOKEN_STORAGE_KEY,
} from "./lib/authApi";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import OrderThankYou from "./pages/OrderThankYou";
import Profile from "./pages/Profile";
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

function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(
    () => getRoleFromToken() === "ADMIN"
  );
  useEffect(() => {
    const sync = () => setIsAdmin(getRoleFromToken() === "ADMIN");
    const unsub = subscribeAuthChanged(sync);
    window.addEventListener("focus", sync);
    return () => {
      unsub();
      window.removeEventListener("focus", sync);
    };
  }, []);
  return isAdmin;
}

function CartHeaderLink() {
  const { totalQuantity } = useCart();
  return (
    <Link
      to="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/90 text-text-primary shadow-sm transition hover:bg-primary/30"
      aria-label={`Giỏ hàng${totalQuantity > 0 ? `, ${totalQuantity} sản phẩm` : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.72a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {totalQuantity > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-text-primary ring-2 ring-white">
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      )}
    </Link>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const hasToken = useHasToken();
  const isAdmin = useIsAdmin();
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
            <CartHeaderLink />
            {hasToken && (
              <>
                <Link
                  to="/profile"
                  className="rounded-lg border border-border bg-primary/40 px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-primary/60"
                >
                  Hồ sơ
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/products"
                      className="rounded-lg border border-border bg-primary/40 px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-primary/60"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      className="rounded-lg border border-border bg-accent/50 px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-accent/70"
                    >
                      Khách hàng
                    </Link>
                    <Link
                      to="/admin/products"
                      className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-secondary/60"
                    >
                      Sản phẩm
                    </Link>
                  </>
                )}
              </>
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
    <>
      <Toaster
        position="top-center"
        richColors={false}
        closeButton
        toastOptions={{
          style: {
            background: "#FDFDFD",
            border: "1px solid #EEEEEE",
            color: "#424242",
          },
        }}
      />
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/thank-you" element={<OrderThankYou />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </>
  );
}
