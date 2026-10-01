import "server-only";

import { cookies, headers } from "next/headers";

const backendUrl = (process.env.LARAVEL_API_URL || "http://127.0.0.1:8001").replace(/\/$/, "");

type LaravelRequestOptions = RequestInit & { forwardSession?: boolean };

export async function laravelRequest(path: string, options: LaravelRequestOptions = {}) {
    const { forwardSession = true, ...init } = options;
    const requestHeaders = new Headers(init.headers);
    requestHeaders.set("Accept", "application/json");

    if (forwardSession) {
        const [requestHeadersIn, cookieStore] = await Promise.all([headers(), cookies()]);
        const cookieHeader = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
        const host = requestHeadersIn.get("x-forwarded-host") || requestHeadersIn.get("host");
        const protocol = requestHeadersIn.get("x-forwarded-proto") || "http";
        const origin = requestHeadersIn.get("origin") || (host ? `${protocol}://${host}` : null);

        if (cookieHeader) requestHeaders.set("Cookie", cookieHeader);
        if (origin) {
            requestHeaders.set("Origin", origin);
            requestHeaders.set("Referer", `${origin}/`);
        }

        const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
        if (xsrfToken && !["GET", "HEAD", "OPTIONS"].includes((init.method || "GET").toUpperCase())) {
            requestHeaders.set("X-XSRF-TOKEN", decodeURIComponent(xsrfToken));
        }
    }

    return fetch(`${backendUrl}${path.startsWith("/") ? path : `/${path}`}`, {
        ...init,
        headers: requestHeaders,
        cache: init.cache || "no-store",
    });
}

export async function laravelJson<T>(path: string, fallback?: T, options: LaravelRequestOptions = {}): Promise<T> {
    try {
        const response = await laravelRequest(path, options);
        if (!response.ok) {
            if (fallback !== undefined) return fallback;
            throw new Error(`Laravel request failed (${response.status}) for ${path}`);
        }
        return await response.json() as T;
    } catch (error) {
        if (fallback !== undefined) return fallback;
        throw error;
    }
}

export async function getLaravelAdmin() {
    const response = await laravelRequest("/api/admin/auth/me");
    if (!response.ok) return null;
    const payload = await response.json() as { user?: Record<string, unknown> };
    return payload.user || null;
}
