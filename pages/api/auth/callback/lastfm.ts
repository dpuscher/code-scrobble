import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getSession } from "../../../../lib/session";
import * as LastFM from "../../../../app/lastfm";
import type { LastFMUserData } from "../../../../app/lastfm";
import User from "../../../../app/models/user";
import type { UserJSON } from "../../../../app/models/user";

async function getLastFMSession(token: string): Promise<{ name: string; key: string }> {
  const method = "auth.getSession";
  const apiKey = process.env.LASTFM_KEY as string;
  const secret = process.env.LASTFM_SECRET as string;

  // Build signature: sorted params (excluding format/callback) concatenated, then append secret
  const sigStr = `api_key${apiKey}method${method}token${token}${secret}`;
  const apiSig = crypto.createHash("md5").update(sigStr).digest("hex");

  const url = `https://ws.audioscrobbler.com/2.0/?method=${method}&api_key=${apiKey}&token=${token}&api_sig=${apiSig}&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) throw new Error(data.message);
  return data.session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.redirect("/login");
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

    const session = await getSession(req, res);
    // eslint-disable-next-line no-underscore-dangle
    session.userId = String(user._id);
    session.user = user.toJSON() as unknown as UserJSON;
    await session.save();

    return res.redirect("/");
  } catch (err) {
    console.error("Last.fm auth error:", err);
    return res.redirect("/login");
  }
}
