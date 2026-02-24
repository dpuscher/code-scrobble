import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getAppRouterSession } from "../../../../lib/session";
import User from "../../../../server/models/user";
import Release from "../../../../server/models/release";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: raw } = await params;
    const [barcode, id] = raw.split("id:");
    const query = id ? { id } : { barcode };

    const release = await Release.firstOrCreate(query);
    if (!release) return NextResponse.json({});

    // eslint-disable-next-line no-underscore-dangle
    const instantScrobble = user.isInstantScrobble(String(release._id));
    return NextResponse.json({ instantScrobble, ...release.toJSON() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
