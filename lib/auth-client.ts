import { createAuthClient } from "better-auth/react";
import { lastfmClientPlugin } from "@ley0x/better-auth-lastfm/client";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [lastfmClientPlugin()],
});

export default authClient;
