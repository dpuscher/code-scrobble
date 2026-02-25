"use client";

import React from "react";
import { useAutoScrobbles } from "../../client/hooks/useAutoScrobbles";
import { Fallback, H3, List, Meta } from "../../styles/profile.styles";
import ProfileAutoScrobbleItem from "./ProfileAutoScrobbleItem";
import Spinner from "../layout/Spinner";

export default function ProfileAutoScrobbles() {
  const { data, isPending, deleteMutation } = useAutoScrobbles();
  const deletingIds = new Set(deleteMutation.variables ? [deleteMutation.variables] : []);

  return (
    <>
      <H3>Auto-scrobbles</H3>
      <Meta>These items are automatically scrobbled the next time they are scanned</Meta>
      {isPending ? (
        <Spinner size={30} css="margin:30px auto;display:block;" />
      ) : (
        <List>
          {!(data ?? []).length && (
            <Fallback>No entries found. Activate the option &quot;Auto-scrobble&quot; during your next scan.</Fallback>
          )}
          {(data ?? []).map((item: any) => (
            <ProfileAutoScrobbleItem
              key={item.id}
              isDeleting={deletingIds.has(item.id)}
              onDelete={() => deleteMutation.mutate(item.id)}
              {...item}
            />
          ))}
        </List>
      )}
    </>
  );
}
