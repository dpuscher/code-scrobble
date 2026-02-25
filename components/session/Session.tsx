"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../client/hooks/useSession";
import { Arrow, Avatar, ImageAndUser, Loader, Menu, MenuItem, Username } from "./styles/Session.styles";
import targetBlank from "../../lib/targetBlank";
import { autotrackParams } from "../../lib/analytics";

export default function Session() {
  const router = useRouter();
  const { data: session, error } = useSession();
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={overlayRef}>
      <Head>
        <link rel="preconnect" href="https://lastfm-img2.akamaized.net" />
      </Head>
      <ImageAndUser>
        {session?.name ? (
          <>
            <Username href={session.url} open={open} {...targetBlank}>
              {session.name}
            </Username>
            <Avatar image={session.image} onClick={() => setOpen(s => !s)} />
          </>
        ) : (
          <Avatar>
            <Loader />
          </Avatar>
        )}
      </ImageAndUser>
      <Arrow open={open} />
      <Menu open={open}>
        <Link href="/profile" passHref legacyBehavior>
          <MenuItem {...autotrackParams("Session", "Profile")}>Profile</MenuItem>
        </Link>
        <Link href="/api/auth/logout" passHref legacyBehavior>
          <MenuItem {...autotrackParams("Session", "Logout")}>Logout</MenuItem>
        </Link>
      </Menu>
    </div>
  );
}
