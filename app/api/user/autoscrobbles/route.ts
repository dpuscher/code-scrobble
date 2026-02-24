import { type NextRequest, NextResponse } from "next/server";
import sortBy from "lodash/sortBy";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getAppRouterSession } from "../../../../lib/session";
import User from "../../../../server/models/user";
import Release from "../../../../server/models/release";

async function getAuthenticatedUser() {
  await connectToDatabase();
  const session = await getAppRouterSession();

  if (!session.userId) return null;

  const user = await User.findById(session.userId);
  return user || null;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const releases = await Release.find({ _id: { $in: user.instantScrobbles } });

    const data = releases.map((release: any) => ({
      // eslint-disable-next-line no-underscore-dangle
      id: release._id,
      artist: release.artist,
      title: release.title,
      year: release.year,
    }));

    return NextResponse.json(sortBy(data, ["artist", "title"]));
  } catch (err) {
    return NextResponse.json({ err }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    // eslint-disable-next-line no-underscore-dangle
    await User.updateOne({ _id: user._id }, { $pullAll: { instantScrobbles: [id] } });
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
