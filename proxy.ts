import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/login", "/legal", "/privacy"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files in /public (e.g. robots.txt, images)
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Skip public pages
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect to login if session cookie is absent
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon\\.ico).*)"],
};
