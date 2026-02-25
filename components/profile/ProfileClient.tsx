"use client";

import React from "react";
import { useSession } from "../../client/hooks/useSession";
import AppRouterBackButton from "../ui/AppRouterBackButton";
import ProfileAutoScrobbles from "./ProfileAutoScrobbles";
import ProfileHistory from "./ProfileHistory";
import { H1, H2, Header, ProfileImg, Wrapper } from "../../styles/profile.styles";

export default function ProfileClient() {
  const { data: session } = useSession();
  const { imageLarge, name } = session || {};

  return (
    <Wrapper>
      <AppRouterBackButton />
      <H1>Profile</H1>
      <Header>
        <ProfileImg src={imageLarge} alt={name} />
        <H2>{name}</H2>
      </Header>
      <ProfileAutoScrobbles />
      <ProfileHistory />
    </Wrapper>
  );
}
