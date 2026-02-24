import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getAppRouterSession } from "../../../../lib/session";
import User from "../../../../server/models/user";
import * as Discogs from "../../../../server/discogs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ query: string }> }) {
  try {
    await connectToDatabase();
    const session = await getAppRouterSession();

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await params;
    const results = await Discogs.search(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
