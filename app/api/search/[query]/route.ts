import { type NextRequest, NextResponse } from "next/server";
import { getAppRouterSession } from "../../../../lib/session";
import * as Discogs from "../../../../server/discogs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ query: string }> }) {
  try {
    const session = await getAppRouterSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await params;
    const results = await Discogs.search(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
