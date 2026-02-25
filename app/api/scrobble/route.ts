import { type NextRequest, NextResponse } from "next/server";
import { getAppRouterSession } from "../../../lib/session";
import { findUserById, appendHistory, addInstantScrobble } from "../../../server/db/userRepository";
import { findReleaseById } from "../../../server/db/releaseRepository";
import * as LastFM from "../../../server/lastfm";

export async function POST(request: NextRequest) {
  try {
    const session = await getAppRouterSession();

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: releaseId, autoScrobble } = await request.json();

    const release = await findReleaseById(releaseId);
    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 400 });
    }

    await appendHistory(session.userId, releaseId);
    if (autoScrobble) {
      await addInstantScrobble(session.userId, releaseId);
    }

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(
        [
          "Scrobble:",
          "-------------------------------",
          `User: ${user.name}`,
          `Release: ${JSON.stringify({ id: release.id, artist: release.artist, title: release.title }, null, 2)}`,
        ].join("\n"),
      );
      return NextResponse.json({});
    }

    const releaseForScrobble = {
      title: release.title,
      artist: release.artist,
      tracks: release.tracks.map(t => ({ title: t.title, trackNumber: t.trackNumber, duration: t.durationSeconds })),
    };
    const response = await LastFM.scrobbleTracks(user.name, user.lastfmSessionKey, releaseForScrobble);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
