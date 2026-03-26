import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  error?: unknown;
};

export function ok<T>(data: T, message = "OK", status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function created<T>(data: T, message = "Created"): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, message, data }, { status: 201 });
}

export function fail(message: string, status: number, error?: unknown): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(error !== undefined ? { error } : {}),
    },
    { status }
  );
}

export function zodError(error: ZodError): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      success: false,
      message: "Validation failed",
      error: error.flatten(),
    },
    { status: 400 }
  );
}

export function fromUnknown(error: unknown, fallback = "Internal server error"): NextResponse<ApiErrorBody> {
  if (error instanceof ZodError) {
    return zodError(error);
  }
  if (error instanceof Error) {
    const dev = process.env.NODE_ENV !== "production";
    return fail(error.message || fallback, 500, dev ? { stack: error.stack } : undefined);
  }
  return fail(fallback, 500);
}
