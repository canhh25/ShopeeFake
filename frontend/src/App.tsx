import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ee4d2d] via-[#ff6b3d] to-[#ffb38a]">
      <header className="border-b border-white/10 bg-black/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-white drop-shadow-sm"
          >
            Shopee<span className="font-black text-yellow-200">Fake</span>
          </Link>
          <nav className="flex gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/95 transition hover:bg-white/10"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-[#ee4d2d] shadow-sm transition hover:bg-white"
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
