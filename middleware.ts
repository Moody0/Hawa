import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname, search, searchParams } = req.nextUrl;

    // Protect /admin routes (except /admin/login)
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            const loginUrl = new URL("/admin/login", req.url);
            // Safe callbackUrl: only use internal pathname and search
            loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Protect /api/admin routes
    if (pathname.startsWith("/api/admin")) {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: Administrative access required" },
                { status: 401 }
            );
        }
    }

    // Canonical /ar and /en route handling
    // Arabic is the canonical default at '/'
    if (pathname === "/ar") {
        const url = new URL("/", req.url);
        url.search = search;
        return NextResponse.redirect(url, 308);
    }
    if (pathname.startsWith("/ar/")) {
        const cleanPath = pathname.replace(/^\/ar/, "") || "/";
        const url = new URL(cleanPath, req.url);
        url.search = search;
        return NextResponse.redirect(url, 308);
    }

    // Redirect legacy ?lang=ar to canonical URL without query param
    if (searchParams.get("lang") === "ar") {
        const url = new URL(pathname, req.url);
        url.searchParams.delete("lang");
        return NextResponse.redirect(url, 308);
    }

    // Support /en routes via rewrite to canonical pages
    if (pathname === "/en") {
        const url = new URL("/", req.url);
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-locale", "en");
        return NextResponse.rewrite(url, {
            request: { headers: requestHeaders },
        });
    }
    if (pathname.startsWith("/en/")) {
        const targetPath = pathname.replace(/^\/en/, "") || "/";
        const url = new URL(targetPath, req.url);
        url.search = search;
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-locale", "en");
        return NextResponse.rewrite(url, {
            request: { headers: requestHeaders },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/ar",
        "/ar/:path*",
        "/en",
        "/en/:path*",
    ],
};
