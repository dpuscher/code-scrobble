import { type NextRequest, NextResponse } from "next/server";
import { getAppRouterSession } from "../../../../lib/session";
import { getInstantScrobbles } from "../../../../server/db/userRepository";
import { firstOrCreateRelease } from "../../../../server/db/releaseRepository";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAppRouterSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: raw } = await params;
    const [scanned, id] = raw.split("id:");
    const barcode = scanned?.replace(/\s+/g, "");
    const query = id ? { id } : { barcode };

    const release = await firstOrCreateRelease(query);
    if (!release) return NextResponse.json({});

    const instantScrobbles = await getInstantScrobbles(session.user.id);
    const instantScrobble = instantScrobbles.includes(release.id);

    return NextResponse.json({
      instantScrobble,
      id: release.id,
      artist: release.artist,
      title: release.title,
      image: release.imageUrl,
      url: release.discogsUrl,
      year: release.releaseYear,
      tracks: release.tracks.map(t => ({
        title: t.title,
        trackNumber: t.trackNumber,
        duration: t.durationSeconds,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
