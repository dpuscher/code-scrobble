import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { getAppRouterSession } from "../../../lib/session";
import User from "../../../server/models/user";
import Release from "../../../server/models/release";
import * as LastFM from "../../../server/lastfm";

export async function POST(request: NextRequest) {
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

    const { id: releaseId, autoScrobble } = await request.json();

    const release = await Release.findOne({ _id: releaseId });
    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 400 });
    }

    user.history = ([{ id: releaseId }] as any).concat(user.history.slice(0, 19));
    if (autoScrobble) (user.instantScrobbles as any).addToSet(releaseId);
    await user.save();

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(
        [
          "Scrobble:",
          "-------------------------------",
          `User: ${user.name}`,
          `Release: ${JSON.stringify(release.toJSON(), ["id", "artist", "title"], 2)}`,
        ].join("\n"),
      );
      return NextResponse.json({});
    }

    const response = await LastFM.scrobbleTracks(user.name, user.key, release);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
