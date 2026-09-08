import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Endpoint to collect Content Security Policy (CSP) violation reports.
 * Allows monitoring of policy violations before strict enforcement.
 */
export async function POST(req: NextRequest) {
    try {
        const report = await req.json().catch(() => null);
        if (report) {
            const cspReport = report["csp-report"] || report;
            console.warn("[CSP Violation]", {
                blockedURI: cspReport["blocked-uri"],
                violatedDirective: cspReport["violated-directive"],
                effectiveDirective: cspReport["effective-directive"],
                originalPolicy: cspReport["original-policy"] ? "present" : undefined,
                documentURI: cspReport["document-uri"],
                referrer: cspReport["referrer"],
            });
        }
        return new NextResponse(null, { status: 204 });
    } catch {
        return new NextResponse(null, { status: 204 });
    }
}
