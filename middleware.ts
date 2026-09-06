import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

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

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
