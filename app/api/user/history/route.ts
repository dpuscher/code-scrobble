import { NextResponse } from "next/server";
import { getAppRouterSession } from "../../../../lib/session";
import { getHistory } from "../../../../server/db/userRepository";
import { findReleaseById } from "../../../../server/db/releaseRepository";

export async function GET() {
  try {
    const session = await getAppRouterSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await getHistory(session.user.id);

    const data = await Promise.all(
      history.map(async item => {
        const release = await findReleaseById(item.releaseId);
        if (!release) return undefined;
        return {
          id: item.id,
          time: item.scrobbledAt,
          artist: release.artist,
          title: release.title,
          year: release.releaseYear,
          barcode: release.barcode,
          discogsId: release.discogsId,
        };
      }),
    );

    const filtered = data.filter(Boolean);
    return NextResponse.json(filtered.sort((a, b) => new Date(b!.time).getTime() - new Date(a!.time).getTime()));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 400 });
  }
}
