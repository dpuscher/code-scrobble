"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { receivedSession } from "../session/actions/sessionActionCreators";
import AppRouterBackButton from "../ui/AppRouterBackButton";
import ProfileAutoScrobbles from "./ProfileAutoScrobbles";
import ProfileHistory from "./ProfileHistory";
import { H1, H2, Header, ProfileImg, Wrapper } from "../../styles/profile.styles";

interface ProfileClientProps {
  initialUser?: {
    id: string;
    name: string;
    url: string;
    image: string;
    imageLarge: string;
    imageXLarge: string;
  };
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const dispatch = useDispatch();
  const session = useSelector((state: any) => state.session.data);

  useEffect(() => {
    if (initialUser) {
      dispatch(receivedSession(initialUser));
    }
  }, [initialUser, dispatch]);

  const user = session || initialUser;
  const { imageLarge, name } = user || {};

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
