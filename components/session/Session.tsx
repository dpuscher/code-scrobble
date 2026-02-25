"use client";

import React, { useEffect, useRef, useState } from "react";
import LastFmImage from "../ui/LastFmImage";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../client/hooks/useSession";
import targetBlank from "../../lib/targetBlank";
import { autotrackParams } from "../../lib/analytics";
import authClient from "../../lib/auth-client";

export default function Session() {
  const router = useRouter();
  const { data: session, error } = useSession();
  console.log("🚀 ~ Session ~ session:", session);
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const signOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  useEffect(() => {
    if (error) router.push("/login");
  }, [error, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const ref = overlayRef.current;
      if (open && ref && !ref.contains(event.target as Node) && document.body.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  if (error) return null;

  const fadeClass = open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";

  return (
    <div ref={overlayRef}>
      <Head>
        <link rel="preconnect" href="https://lastfm-img2.akamaized.net" />
      </Head>
      <div className="flex items-center">
        {session?.name ? (
          <>
            <a
              href={session.url}
              className={`pr-3 text-sm no-underline transition-opacity duration-300 ${fadeClass}`}
              {...targetBlank}
            >
              {session.name}
            </a>
            <button
              type="button"
              aria-label="Open menu"
              className="relative z-10 w-[8vw] max-w-[50px] h-[8vw] max-h-[50px] rounded-full bg-[#ccc] overflow-hidden cursor-pointer border-0 p-0"
              onClick={() => setOpen(s => !s)}
            >
              {session.image && (
                <LastFmImage src={session.image} alt={session.name} fill sizes="50px" className="object-cover" />
              )}
            </button>
          </>
        ) : (
          <div className="z-10 w-[8vw] max-w-[50px] h-[8vw] max-h-[50px] rounded-full bg-[#ccc] bg-cover cursor-pointer">
            <div className="w-full h-full rounded-full border-2 border-[rgba(254,218,106,0.3)] border-t-yellow animate-spin-ease" />
          </div>
        )}
      </div>
      <div className={`session-arrow transition-opacity duration-300 ${fadeClass}`} />
      <div
        className={`absolute right-0 mt-2 rounded-[3px] bg-white text-dark text-right transition-opacity duration-300 ${fadeClass}`}
      >
        <Link
          href="/profile"
          className="block w-full px-5 py-[10px] text-dark cursor-pointer no-underline text-right"
          {...autotrackParams("Session", "Profile")}
        >
          Profile
        </Link>
        <button
          type="button"
          className="block w-full px-5 py-[10px] text-dark cursor-pointer no-underline text-right bg-transparent border-0"
          onClick={signOut}
          {...autotrackParams("Session", "Logout")}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
