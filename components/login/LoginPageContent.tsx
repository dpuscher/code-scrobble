"use client";

import LogoModule from "../assets/Logo";
import LegalLinks from "../ui/LegalLinks";
import LoginButton from "../ui/LoginButton";
import { autotrackParams } from "../../lib/analytics";
import authClient from "../../lib/auth-client";

export default function LoginPageContent() {
  return (
    <div className="flex items-center justify-center w-full min-h-full py-[15px]">
      <div className="flex flex-col items-center justify-center text-center">
        <header>
          <h1 className="m-0">
            <LogoModule className="w-[300px] h-auto" alt="CodeScrobble" />
          </h1>
        </header>
        <main>
          <div className="max-w-[600px] px-[30px]">
            <p className="my-[30px]">CodeScrobble makes it easy to scrobble your CD or vinyl records to Last.fm.</p>
            <p className="my-[30px]">
              Just use you smartphone camera to scan the barcode, check the result and you are done. We also have an
              auto-scrobble mode, that makes scrobbling even faster.
            </p>
          </div>
          <LoginButton onClick={() => authClient.signInWithLastfm()} {...autotrackParams("Session", "Login")} />
        </main>
      </div>
      <LegalLinks />
    </div>
  );
}
