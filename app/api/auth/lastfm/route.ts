import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host");
  const callbackUrl = `${protocol}://${host}/api/auth/callback/lastfm`;
  const authUrl = `https://www.last.fm/api/auth/?api_key=${process.env.LASTFM_KEY}&cb=${encodeURIComponent(callbackUrl)}`;
  return NextResponse.redirect(authUrl);
}
