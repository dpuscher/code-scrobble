import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const callbackUrl = `${protocol}://${host}/api/auth/callback/lastfm`;
  const authUrl = `https://www.last.fm/api/auth/?api_key=${process.env.LASTFM_KEY}&cb=${encodeURIComponent(callbackUrl)}`;
  res.redirect(authUrl);
}
