import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export async function proxy(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;
  const forwarded = new Headers(req.headers);
  forwarded.set('x-admin-return-to', pathname + search);
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
  return NextResponse.next({request:{headers:forwarded}});
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/ar", "/ar/:path*", "/en", "/en/:path*"],
};
