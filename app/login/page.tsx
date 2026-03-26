"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, setAuthToken } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/login", { email, password });
      if (data.success && data.data?.token) {
        localStorage.setItem("primetrade_token", data.data.token);
        setAuthToken(data.data.token);
        setMessage({ type: "ok", text: data.message ?? "Signed in" });
        router.push("/dashboard");
        return;
      }
      setMessage({ type: "err", text: data.message ?? "Login failed" });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setMessage({ type: "err", text: ax.response?.data?.message ?? "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 bg-mesh-light">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-ink-900 p-10 text-white lg:flex">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(27, 161, 121, 0.45) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 45%)",
            }}
          />
          <Link href="/" className="relative z-10 font-display text-xl font-bold">
            Prime<span className="text-brand-300">Trade</span>
          </Link>
          <div className="relative z-10 max-w-sm">
            <p className="font-display text-2xl font-semibold leading-snug">
              Welcome back. Your tasks and tokens are waiting.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Secure JWT sessions, bcrypt-backed accounts, and a clean REST surface for demos and interviews.
            </p>
          </div>
          <p className="relative z-10 text-xs text-white/45">Local dev · Next.js 14 · MongoDB</p>
        </div>

        <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="font-display text-xl font-bold text-ink-900">
                Prime<span className="text-brand-600">Trade</span>
              </Link>
            </div>
            <div className="pt-card p-8 shadow-soft sm:p-10">
              <h1 className="font-display text-2xl font-bold text-ink-900">Sign in</h1>
              <p className="mt-2 text-sm text-ink-600">
                New here?{" "}
                <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                  Create an account
                </Link>
              </p>
              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="pt-label" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="pt-input mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="pt-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="pt-input mt-1.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                {message ? (
                  <p className={message.type === "ok" ? "pt-alert-ok" : "pt-alert-err"} role="status">
                    {message.text}
                  </p>
                ) : null}
                <button type="submit" disabled={loading} className="pt-btn-primary w-full py-3">
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
              <p className="mt-8 text-center text-xs text-ink-500">
                <Link href="/" className="font-medium text-ink-700 hover:underline">
                  Home
                </Link>
                <span className="mx-2 text-ink-300">·</span>
                <Link href="/api-docs" className="font-medium text-ink-700 hover:underline">
                  API docs
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
