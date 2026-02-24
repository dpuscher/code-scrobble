import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "./mongodb";
import { getSession } from "./session";
import User from "../server/models/user";

export async function requireUser(req: NextApiRequest, res: NextApiResponse): Promise<any | null> {
  await connectToDatabase();
  const session = await getSession(req, res);

  if (!session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const user = await User.findById(session.userId);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return user;
}
