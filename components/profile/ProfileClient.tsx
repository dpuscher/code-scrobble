"use client";

import React from "react";
import LastFmImage from "../ui/LastFmImage";
import { useSession } from "../../client/hooks/useSession";
import AppRouterBackButton from "../ui/AppRouterBackButton";
import ProfileAutoScrobbles from "./ProfileAutoScrobbles";
import ProfileHistory from "./ProfileHistory";

export default function ProfileClient() {
  const { data: session } = useSession();
  const { image, name } = session || {};

  return (
    <div className="w-full max-w-[768px] mx-auto py-[72px] px-5 pb-5 leading-[1.4] break-words">
      <AppRouterBackButton />
      <h1 className="m-0 mb-5">Profile</h1>
      <header className="flex items-center">
        {image && (
          <LastFmImage src={image} alt={name ?? ""} width={87} height={87} className="flex-none rounded-full" />
        )}
        <h2 className="m-0 pl-[30px]">{name}</h2>
      </header>
      <ProfileAutoScrobbles />
      <ProfileHistory />
    </div>
  );
}
