import { NextResponse } from "next/server";
import { verifyToken, type AccessTokenPayload } from "@/lib/auth";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function getBearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization");
  if (!raw?.startsWith("Bearer ")) {
    return null;
  }
  const token = raw.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function requireAuth(request: Request): AccessTokenPayload {
  const token = getBearerToken(request);
  if (!token) {
    throw new AuthError(401, "Missing or invalid Authorization header");
  }
  try {
    return verifyToken(token);
  } catch {
    throw new AuthError(401, "Invalid or expired token");
  }
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        error: { code: "UNAUTHORIZED" },
      },
      { status: error.status }
    );
  }
  throw error;
}
