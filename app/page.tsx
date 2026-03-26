import Link from "next/link";
import HeaderAuthActions from "@/components/HeaderAuthActions";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-50 bg-mesh-light">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />
      <header className="relative z-10 border-b border-ink-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink-900">
            Prime<span className="text-brand-600">Trade</span>
          </Link>
          <HeaderAuthActions mode="home" />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-800">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
              Assignment demo
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.25rem]">
              Tasks, auth, and APIs—
              <span className="text-brand-600"> in one place</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              JWT-secured REST API under{" "}
              <code className="rounded-lg bg-ink-100/90 px-1.5 py-0.5 text-sm font-semibold text-ink-800">
                /api/v1
              </code>
              , role-aware access, and a workspace to manage your task list.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/register" className="pt-btn-primary min-w-[140px] px-6 py-3">
                Create account
              </Link>
              <Link href="/login" className="pt-btn-secondary min-w-[140px] px-6 py-3">
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
              >
                Open dashboard ?
              </Link>
            </div>
          </div>

          <div className="animate-fade-up lg:pl-4" style={{ animationDelay: "120ms" }}>
            <div className="pt-card relative p-6 sm:p-8">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-200/40 blur-3xl" aria-hidden />
              <h2 className="font-display text-lg font-semibold text-ink-900">Quick links</h2>
              <p className="mt-1 text-sm text-ink-500">Everything you need to test the stack.</p>
              <ul className="mt-6 space-y-3">
                {[
                  { href: "/register", title: "Register", desc: "New user + JWT token" },
                  { href: "/login", title: "Sign in", desc: "Existing credentials" },
                  { href: "/dashboard", title: "Dashboard", desc: "CRUD tasks with bearer auth" },
                  { href: "/api-docs", title: "Swagger UI", desc: "OpenAPI for v1 endpoints" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between rounded-xl border border-transparent bg-ink-50/50 px-4 py-3 transition hover:border-brand-200/60 hover:bg-white hover:shadow-soft"
                    >
                      <div>
                        <p className="font-semibold text-ink-900 group-hover:text-brand-700">{item.title}</p>
                        <p className="text-xs text-ink-500">{item.desc}</p>
                      </div>
                      <span className="text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden>
                        ?
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
