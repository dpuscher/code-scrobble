import { auth } from "./auth";
import { headers } from "next/headers";

export async function getAppRouterSession() {
  return auth.api.getSession({ headers: await headers() });
}
