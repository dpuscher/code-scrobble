import { NextResponse } from "next/server";
import find from "lodash/find";
import sortBy from "lodash/sortBy";
import compact from "lodash/compact";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getAppRouterSession } from "../../../../lib/session";
import User from "../../../../server/models/user";
import Release from "../../../../server/models/release";

export async function GET() {
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

    const { history } = user;
    const releases = await Release.find({ _id: { $in: history.map((h: any) => h.id) } });

    const data = history.map((item: any) => {
      // eslint-disable-next-line no-underscore-dangle
      const release = find(releases, (r: any) => String(r._id) === item.id);
      if (!release) return undefined;
      return {
        // eslint-disable-next-line no-underscore-dangle
        id: item._id,
        time: item.time,
        artist: release.artist,
        title: release.title,
        year: release.year,
        barcode: release.barcode,
        discogsId: release.id,
      };
    });

    return NextResponse.json(sortBy(compact(data), ["time"]).reverse());
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 400 });
  }
}
