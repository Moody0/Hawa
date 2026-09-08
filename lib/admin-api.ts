import { NextResponse } from "next/server";
import { AdminAuthorizationError } from "@/lib/admin-auth";

export function adminApiError(error: unknown): NextResponse {
  if (error instanceof AdminAuthorizationError) {
    return NextResponse.json(
      { ok: false, code: error.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN" },
      { status: error.status },
    );
  }
  console.error("Unexpected administrator API error", error);
  return NextResponse.json({ ok: false, code: "INTERNAL_ERROR" }, { status: 500 });
}

export function validationError(fieldErrors: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    { ok: false, code: "VALIDATION_ERROR", fieldErrors },
    { status: 400 },
  );
}

