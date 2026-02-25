import { NextResponse } from "next/server";
import { getAppRouterSession } from "../../../lib/session";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const session = await getAppRouterSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      url: user.lastfmUrl,
      image: user.image,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
