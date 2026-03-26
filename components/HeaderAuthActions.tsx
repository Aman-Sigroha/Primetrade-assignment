"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  mode: "home" | "docs";
};

export default function HeaderAuthActions({ mode }: Props) {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        setHasToken(Boolean(localStorage.getItem("primetrade_token")));
      } catch {
        setHasToken(false);
      }
    };

    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function logout() {
    localStorage.removeItem("primetrade_token");
    setHasToken(false);
  }

  if (mode === "docs") {
    return (
      <div className="flex items-center gap-3 text-sm font-semibold">
        <Link href="/dashboard" className="text-ink-600 hover:text-ink-900">
          Dashboard
        </Link>
        {hasToken ? (
          <button
            type="button"
            onClick={logout}
            className="text-ink-600 hover:text-ink-900"
          >
            Log out
          </button>
        ) : (
          <Link href="/login" className="text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        )}
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-sm font-medium text-ink-600">
      <Link href="/api-docs" className="rounded-lg px-3 py-1.5 hover:bg-ink-100/80 hover:text-ink-900">
        API docs
      </Link>
      {hasToken ? (
        <>
          <Link href="/dashboard" className="rounded-lg px-3 py-1.5 hover:bg-ink-100/80 hover:text-ink-900">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-1.5 hover:bg-ink-100/80 hover:text-ink-900"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="rounded-lg px-3 py-1.5 hover:bg-ink-100/80 hover:text-ink-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="ml-1 rounded-lg bg-brand-600 px-4 py-1.5 text-white shadow-sm hover:bg-brand-700"
          >
            Get started
          </Link>
        </>
      )}
    </nav>
  );
}
