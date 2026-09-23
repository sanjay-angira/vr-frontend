import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { homepageLinkPreviewHtml, isLinkPreviewBot } from "@/lib/linkPreview";
import { STORAGE_KEYS } from "@/services/api/storage";

const ADMIN_PUBLIC_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

function hasAdminSession(request: NextRequest): boolean {
  return request.cookies.get(STORAGE_KEYS.adminSession)?.value === "1";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" &&
    isLinkPreviewBot(request.headers.get("user-agent"))
  ) {
    return new NextResponse(homepageLinkPreviewHtml(), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  console.log("pathname", pathname);

  if (pathname === "/admin" || pathname === "/admin/") {
    if (hasAdminSession(request)) {
      return NextResponse.redirect(new URL("/admin/dashboard",request.url));
    }
    return NextResponse.redirect(new URL("/admin/login",request.url));
  }

  if (ADMIN_PUBLIC_PATHS.has(pathname)) {
    if (hasAdminSession(request)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!hasAdminSession(request)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*"],
};
