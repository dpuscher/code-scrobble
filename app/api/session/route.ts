import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { getAppRouterSession } from "../../../lib/session";
import User from "../../../server/models/user";

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

    return NextResponse.json(user.toJSON());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
