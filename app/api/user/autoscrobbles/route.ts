import { type NextRequest, NextResponse } from "next/server";
import { getAppRouterSession } from "../../../../lib/session";
import { findUserById, getInstantScrobbles, removeInstantScrobble } from "../../../../server/db/userRepository";
import { findReleaseById } from "../../../../server/db/releaseRepository";

export async function GET() {
  try {
    const session = await getAppRouterSession();

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const releaseIds = await getInstantScrobbles(session.userId);
    const releases = await Promise.all(releaseIds.map(releaseId => findReleaseById(releaseId)));

    const data = releases
      .filter(Boolean)
      .map(release => ({
        id: release!.id,
        artist: release!.artist,
        title: release!.title,
        year: release!.releaseYear,
      }))
      .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ err }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAppRouterSession();

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    await removeInstantScrobble(session.userId, id);
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
