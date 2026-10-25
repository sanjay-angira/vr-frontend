import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { homepageLinkPreviewHtml, isLinkPreviewBot } from "@/lib/linkPreview";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
