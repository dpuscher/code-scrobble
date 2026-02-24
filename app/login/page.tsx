import type { Metadata } from "next";
import LoginPageContent from "../../components/login/LoginPageContent";

export const metadata: Metadata = {
  title: "Login | CodeScrobble",
};

export default function LoginPage() {
  return <LoginPageContent />;
}
