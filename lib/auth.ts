import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { lastfmPlugin } from "@ley0x/better-auth-lastfm";
import { prisma } from "./prisma";
import * as LastFM from "../server/lastfm";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [
    lastfmPlugin({
      apiKey: process.env.LASTFM_KEY!,
      sharedSecret: process.env.LASTFM_SECRET!,
      redirectTo: "/",
    }),
  ],
  advanced: {
    database: {
      // Preserve 24-char hex format for FK compatibility with existing tables
      generateId: () => require("crypto").randomBytes(12).toString("hex"),
    },
  },
  user: {
    additionalFields: {
      lastfmUrl: { type: "string", nullable: true },
    },
  },
  databaseHooks: {
    session: {
      create: {
        // Refresh Last.fm profile (image/URL) on every sign-in
        after: async session => {
          try {
            const account = await prisma.account.findFirst({
              where: { userId: session.userId, providerId: "lastfm" },
            });
            if (!account?.accessToken) return;
            const user = await prisma.user.findUnique({ where: { id: session.userId } });
            if (!user) return;
            const profile = (await LastFM.getUserData(user.name, account.accessToken)) as any;
            console.log("🚀 ~ profile:", profile);
            await prisma.user.update({
              where: { id: session.userId },
              data: {
                lastfmUrl: profile.url ?? null,
                image: profile?.image?.[3]?.["#text"] ?? null,
              },
            });
          } catch {
            // non-fatal — user still logs in successfully
          }
        },
      },
    },
  },
});
