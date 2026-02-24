import { type NextRequest, NextResponse } from "next/server";
import { getAppRouterSession } from "../../../../lib/session";

export async function GET(request: NextRequest) {
  const session = await getAppRouterSession();
  session.destroy();
  return NextResponse.redirect(new URL("/", request.url));
}
