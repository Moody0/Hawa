import { NextRequest, NextResponse } from "next/server";
import {
    recordWebVital,
    recordApiLatency,
    recordErrorEvent,
    getMonitoringStats,
    WebVitalEvent,
    ApiLatencyEvent,
    ErrorEvent,
} from "@/lib/monitoring";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Ingests privacy-safe Core Web Vitals, API Latency measurements, and Reliability Errors.
 * Designed to receive batches or single events via navigator.sendBeacon or fetch.
 */
export async function POST(req: NextRequest) {
    try {
        // Apply rate limiting to prevent telemetry flooding
        const ip = getClientIp(req);
        const rateCheck = checkRateLimit(`monitoring:${ip}`, 120, 60_000); // Max 120 posts/min
        if (!rateCheck.allowed) {
            return new NextResponse(null, { status: 429 });
        }

        const payload = await req.json().catch(() => null);
        if (!payload) {
            return new NextResponse(null, { status: 400 });
        }

        // 1. Process Web Vitals
        if (Array.isArray(payload.vitals)) {
            for (const vital of payload.vitals) {
                if (vital && vital.name && typeof vital.value === "number") {
                    recordWebVital(vital as WebVitalEvent);
                }
            }
        } else if (payload.vital && payload.vital.name && typeof payload.vital.value === "number") {
            recordWebVital(payload.vital as WebVitalEvent);
        }

        // 2. Process API Latency events
        if (Array.isArray(payload.latencies)) {
            for (const lat of payload.latencies) {
                if (lat && lat.endpoint && typeof lat.durationMs === "number") {
                    recordApiLatency(lat as ApiLatencyEvent);
                }
            }
        } else if (payload.latency && payload.latency.endpoint && typeof payload.latency.durationMs === "number") {
            recordApiLatency(payload.latency as ApiLatencyEvent);
        }

        // 3. Process Reliability Error events
        if (Array.isArray(payload.errors)) {
            for (const err of payload.errors) {
                if (err && err.category && err.message) {
                    recordErrorEvent(err as ErrorEvent);
                }
            }
        } else if (payload.error && payload.error.category && payload.error.message) {
            recordErrorEvent(payload.error as ErrorEvent);
        }

        return new NextResponse(null, { status: 204 });
    } catch {
        return new NextResponse(null, { status: 204 });
    }
}

/**
 * Diagnostic & Health telemetry endpoint for production monitoring inspection.
 */
export async function GET() {
    const stats = getMonitoringStats();
    return NextResponse.json(
        {
            status: "healthy",
            timestamp: new Date().toISOString(),
            stats,
        },
        {
            status: 200,
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        }
    );
}
