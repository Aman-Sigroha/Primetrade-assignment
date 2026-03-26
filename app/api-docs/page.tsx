"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import HeaderAuthActions from "@/components/HeaderAuthActions";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-display text-lg font-bold text-ink-900">
            Prime<span className="text-brand-600">Trade</span>
          </Link>
          <HeaderAuthActions mode="docs" />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink-900">API documentation</h1>
          <p className="mt-2 text-sm text-ink-600">
            OpenAPI 3 spec:{" "}
            <code className="rounded-lg bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-800">
              /openapi.yaml
            </code>
          </p>
        </div>
        <div className="pt-card overflow-hidden p-2 sm:p-4">
          <SwaggerUI url="/openapi.yaml" docExpansion="list" defaultModelsExpandDepth={1} />
        </div>
      </div>
    </div>
  );
}
