"use client";

import React from "react";
import { useHistory } from "../../client/hooks/useHistory";
import { Fallback, H3, List, Meta } from "../../styles/profile.styles";
import ProfileHistoryItem from "./ProfileHistoryItem";
import Spinner from "../layout/Spinner";

export default function ProfileHistory() {
  const { data: history, isPending } = useHistory();

  return (
    <>
      <H3>History</H3>
      <Meta>Your recently scanned items. Tap one to scrobble it again.</Meta>
      {isPending ? (
        <Spinner size={30} css="margin:30px auto;display:block;" />
      ) : (
        <List>
          {!(history ?? []).length && <Fallback>No entries found.</Fallback>}
          {(history ?? []).map((item: any) => (
            <ProfileHistoryItem key={item.id} {...item} />
          ))}
        </List>
      )}
    </>
  );
}
