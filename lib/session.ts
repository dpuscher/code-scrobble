import { getIronSession, IronSession, SessionOptions } from "iron-session";
import type { IncomingMessage, ServerResponse } from "http";

export interface SessionData {
  userId?: string;
  user?: {
    id: string;
    name: string;
    url: string;
    image: string;
    imageLarge: string;
    imageXLarge: string;
  };
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "code-scrobble-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 2592000, // 30 days in seconds
  },
};

export function getSession(req: IncomingMessage, res: ServerResponse): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, sessionOptions);
}
