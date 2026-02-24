import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { getAppRouterSession } from "../../../../../lib/session";
import * as LastFM from "../../../../../server/lastfm";
import type { LastFMUserData } from "../../../../../server/lastfm";
import User from "../../../../../server/models/user";
import type { UserJSON } from "../../../../../server/models/user";

async function getLastFMSession(token: string): Promise<{ name: string; key: string }> {
  const method = "auth.getSession";
  const apiKey = process.env.LASTFM_KEY as string;
  const secret = process.env.LASTFM_SECRET as string;

  const sigStr = `api_key${apiKey}method${method}token${token}${secret}`;
  const apiSig = crypto.createHash("md5").update(sigStr).digest("hex");

  const url = `https://ws.audioscrobbler.com/2.0/?method=${method}&api_key=${apiKey}&token=${token}&api_sig=${apiSig}&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) throw new Error(data.message);
  return data.session;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await connectToDatabase();

    const { name, key } = await getLastFMSession(token);

    let user = await User.findOne({ name });
    if (!user) user = new User();

    user.name = name;
    user.key = key;

    const userData = (await LastFM.getUserData(name, key)) as LastFMUserData;
    user.url = userData.url;
    user.image = userData?.image?.[1]?.["#text"];
    user.imageLarge = userData?.image?.[2]?.["#text"];
    user.imageXLarge = userData?.image?.[3]?.["#text"];

    await user.save();

    const session = await getAppRouterSession();
    // eslint-disable-next-line no-underscore-dangle
    session.userId = String(user._id);
    session.user = user.toJSON() as unknown as UserJSON;
    await session.save();

    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    console.error("Last.fm auth error:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
