"use client";

let csrfRequest: Promise<void> | null = null;
let loginInProgress: Promise<void> | null = null;
const pendingRequests = new Set<Promise<Response>>();

export class SessionVerificationError extends Error {
    constructor() {
        super("Could not establish the login session. Please try again.");
        this.name = "SessionVerificationError";
    }
}

async function ensureCsrfCookie() {
    if (!csrfRequest) {
        csrfRequest = fetch("/sanctum/csrf-cookie", {
            credentials: "same-origin",
            cache: "no-store",
            headers: { Accept: "application/json" },
        }).then((response) => {
            if (!response.ok) throw new SessionVerificationError();
        }).finally(() => {
            csrfRequest = null;
        });
    }
    await csrfRequest;
}

function xsrfToken() {
    const value = document.cookie.split("; ").find((cookie) => cookie.startsWith("XSRF-TOKEN="))?.slice("XSRF-TOKEN=".length);
    return value ? decodeURIComponent(value) : null;
}

async function performRequest(input: RequestInfo | URL, init: RequestInit = {}) {
    const method = (init.method || "GET").toUpperCase();
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");

    if (!new Set(["GET", "HEAD", "OPTIONS"]).has(method)) {
        await ensureCsrfCookie();
        const token = xsrfToken();
        if (token) headers.set("X-XSRF-TOKEN", token);
    }

    const response = await fetch(input, { ...init, headers, credentials: "same-origin", cache: init.cache ?? "no-store" });
    // A rejected CSRF request has not reached the action. Refresh its token once,
    // which also handles token rotation after logout in another tab.
    if (response.status === 419 && !new Set(["GET", "HEAD", "OPTIONS"]).has(method)) {
        await ensureCsrfCookie();
        const token = xsrfToken();
        if (token) headers.set("X-XSRF-TOKEN", token);
        return fetch(input, { ...init, headers, credentials: "same-origin", cache: "no-store" });
    }
    return response;
}

export function authErrorMessage(status: number, data: any, isArabic: boolean): string {
    if (status === 401) return isArabic ? 'رقم الهاتف أو اسم المستخدم أو كلمة المرور غير صحيحة.' : 'The phone number, username, or password is incorrect.';
    if (status === 409) return isArabic ? 'رقم الهاتف مسجل مسبقاً. سجل الدخول أو تواصل مع الدعم.' : 'This phone already has an account. Sign in or contact support.';
    if (status === 429) return isArabic ? 'محاولات كثيرة. يرجى الانتظار بضع دقائق ثم المحاولة.' : 'Too many attempts. Please wait a few minutes and try again.';
    if (status === 419) return isArabic ? 'انتهت صلاحية الجلسة. أعد تحميل الصفحة ثم حاول مجدداً.' : 'Your session expired. Reload the page and try again.';
    if (status >= 500) return isArabic ? 'الخدمة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.' : 'The service is temporarily unavailable. Please try again later.';
    const field = Object.keys(data?.errors || {})[0];
    const labels: Record<string, [string, string]> = { shopName: ['اسم المحل', 'store name'], ownerName: ['اسم صاحب المحل', 'owner name'], phone: ['رقم الهاتف', 'phone number'], address: ['العنوان', 'address'], city: ['المحافظة', 'governorate'], password: ['كلمة المرور', 'password'] };
    if (field) return isArabic ? `يرجى التحقق من ${labels[field]?.[0] || 'البيانات المدخلة'}.` : String(data.errors[field]?.[0] || `Please check the ${labels[field]?.[1] || field}.`);
    return isArabic ? 'يرجى التحقق من البيانات والمحاولة مجدداً.' : String(data?.message || data?.error || 'Please check your details and try again.');
}

export async function laravelClientFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    while (loginInProgress) await loginInProgress;

    const path = typeof input === 'string' ? input : input instanceof URL ? input.pathname : new URL(input.url).pathname;
    if (/^\/api\/(?:admin|customer)\/auth\/logout$/.test(path) && init.method?.toUpperCase() === 'POST') {
        let finishLogout!: () => void;
        loginInProgress = new Promise<void>(resolve => { finishLogout = resolve; });
        try {
            await Promise.allSettled([...pendingRequests]);
            return await performRequest(input, init);
        } finally {
            loginInProgress = null;
            finishLogout();
        }
    }

    const request = performRequest(input, init);
    pendingRequests.add(request);
    try {
        return await request;
    } finally {
        pendingRequests.delete(request);
    }
}

export async function laravelLogin(account: "admin" | "customer", credentials: Record<string, unknown>) {
    while (loginInProgress) await loginInProgress;

    let finishLogin!: () => void;
    loginInProgress = new Promise<void>((resolve) => { finishLogin = resolve; });
    try {
        // Finish earlier API responses before rotating the session cookie, and
        // hold background requests until the new session has been verified.
        await Promise.allSettled([...pendingRequests]);
        const path = `/api/${account}/auth`;
        const response = await performRequest(`${path}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            cache: "no-store",
        });
        if (!response.ok) return response;

        const key = account === "admin" ? "user" : "customer";
        const signedIn = await response.clone().json();
        const sessionResponse = await performRequest(`${path}/me`, { cache: "no-store" });
        const session = await sessionResponse.json().catch(() => null);
        if (!sessionResponse.ok || !signedIn?.[key]?.id || session?.[key]?.id !== signedIn[key].id) {
            throw new SessionVerificationError();
        }
        return response;
    } finally {
        loginInProgress = null;
        finishLogin();
    }
}

export function adminLoginDestination(callback: string | null) {
    if (callback && !/[\\\u0000-\u001f]/u.test(callback)) {
        const base = "https://hawa.invalid";
        try {
            const destination = new URL(callback, base);
            if (destination.origin === base && destination.pathname.startsWith("/admin/") && !destination.pathname.startsWith("/admin/login")) {
                return `${destination.pathname}${destination.search}${destination.hash}`;
            }
        } catch {
            // Ignore malformed callback URLs and use the dashboard.
        }
    }
    return "/admin/dashboard";
}
