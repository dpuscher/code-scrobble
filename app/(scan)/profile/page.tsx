import { redirect } from "next/navigation";
import { getAppRouterSession } from "../../../lib/session";
import ProfileClient from "../../../components/profile/ProfileClient";

export default async function ProfilePage() {
  const session = await getAppRouterSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <ProfileClient />;
}
