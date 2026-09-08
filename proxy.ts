import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ ok: false, code: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    const url = new URL(pathname.replace(/^\/ar/, "") || "/", req.url);
    url.search = search;
    return NextResponse.redirect(url, 308);
  }
  if (searchParams.get("lang") === "ar") {
    const url = new URL(pathname, req.url);
    url.searchParams.delete("lang");
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = new URL(pathname.replace(/^\/en/, "") || "/", req.url);
    url.search = search;
    // Arabic is the only supported site language. Keep old /en links working
    // by redirecting them to the canonical Arabic URL.
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/ar", "/ar/:path*", "/en", "/en/:path*"],
};
