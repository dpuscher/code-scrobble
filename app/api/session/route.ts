import { NextResponse } from "next/server";
import { getAppRouterSession } from "../../../lib/session";
import { findUserById } from "../../../server/db/userRepository";

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

    return NextResponse.json({
      id: user.id,
      name: user.name,
      url: user.lastfmUrl,
      image: user.imageSmall,
      imageLarge: user.imageLarge,
      imageXLarge: user.imageXLarge,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
