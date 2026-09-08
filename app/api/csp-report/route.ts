import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, checkRequestBodyLimit, getClientIp } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

/**
 * Endpoint to collect Content Security Policy (CSP) violation reports.
 * Allows monitoring of policy violations before strict enforcement.
 */
export async function POST(req: NextRequest) {
    try {
        if (!checkRequestBodyLimit(req, 20 * 1024)) return new NextResponse(null, { status: 413 });
        const rate = checkRateLimit(`csp:${getClientIp(req)}`, 30, 60_000);
        if (!rate.allowed) return new NextResponse(null, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
        const report = await req.json().catch(() => null);
        if (report) {
            const cspReport = report["csp-report"] || report;
            const cleanUri = (value: unknown) => {
                if (typeof value !== "string") return undefined;
                try { const url = new URL(value); return `${url.origin}${url.pathname}`.slice(0, 500); } catch { return value.slice(0, 200); }
            };
            Sentry.captureEvent({
              message: "csp_violation",
              level: "warning",
              tags: {
                effectiveDirective: String(cspReport["effective-directive"] || "unknown").slice(0, 100),
                violatedDirective: String(cspReport["violated-directive"] || "unknown").slice(0, 100),
              },
              extra: {
                blockedURI: cleanUri(cspReport["blocked-uri"]),
                violatedDirective: cspReport["violated-directive"],
                documentURI: cleanUri(cspReport["document-uri"]),
              },
            });
        }
        return new NextResponse(null, { status: 204 });
    } catch {
        return new NextResponse(null, { status: 204 });
    }
}
