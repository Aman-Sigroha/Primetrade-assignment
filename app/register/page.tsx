"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, setAuthToken } from "@/lib/client-api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/register", { name, email, password });
      if (data.success && data.data?.token) {
        localStorage.setItem("primetrade_token", data.data.token);
        setAuthToken(data.data.token);
        setMessage({ type: "ok", text: data.message ?? "Registered" });
        router.push("/dashboard");
        return;
      }
      setMessage({ type: "err", text: data.message ?? "Registration failed" });
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
        <div className="relative order-2 hidden flex-col justify-between bg-ink-900 p-10 text-white lg:order-2 lg:flex">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 70% 30%, rgba(27, 161, 121, 0.5) 0%, transparent 50%), radial-gradient(ellipse at 20% 90%, rgba(255,255,255,0.06) 0%, transparent 40%)",
            }}
          />
          <Link href="/" className="relative z-10 font-display text-xl font-bold">
            Prime<span className="text-brand-300">Trade</span>
          </Link>
          <div className="relative z-10 max-w-sm">
            <p className="font-display text-2xl font-semibold leading-snug">Ship the assignment with confidence.</p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Modular API layout, Zod validation, and a UI that proves everything works end-to-end.
            </p>
          </div>
          <p className="relative z-10 text-xs text-white/45">Password min. 8 characters</p>
        </div>

        <div className="order-1 flex flex-col justify-center px-4 py-12 sm:px-8 lg:order-1 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="font-display text-xl font-bold text-ink-900">
                Prime<span className="text-brand-600">Trade</span>
              </Link>
            </div>
            <div className="pt-card p-8 shadow-soft sm:p-10">
              <h1 className="font-display text-2xl font-bold text-ink-900">Create account</h1>
              <p className="mt-2 text-sm text-ink-600">
                Already registered?{" "}
                <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                  Sign in
                </Link>
              </p>
              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="pt-label" htmlFor="reg-name">
                    Name
                  </label>
                  <input
                    id="reg-name"
                    className="pt-input mt-1.5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="pt-label" htmlFor="reg-email">
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    className="pt-input mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="pt-label" htmlFor="reg-password">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    className="pt-input mt-1.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <p className="mt-1.5 text-xs text-ink-500">At least 8 characters</p>
                </div>
                {message ? (
                  <p className={message.type === "ok" ? "pt-alert-ok" : "pt-alert-err"} role="status">
                    {message.text}
                  </p>
                ) : null}
                <button type="submit" disabled={loading} className="pt-btn-primary w-full py-3">
                  {loading ? "Creating account…" : "Register"}
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
