"use client";

import React from "react";
import { useAutoScrobbles } from "../../client/hooks/useAutoScrobbles";
import ProfileAutoScrobbleItem from "./ProfileAutoScrobbleItem";
import Spinner from "../layout/Spinner";

export default function ProfileAutoScrobbles() {
  const { data, isPending, deleteMutation } = useAutoScrobbles();
  const deletingIds = new Set(deleteMutation.variables ? [deleteMutation.variables] : []);

  return (
    <>
      <h3 className="mt-[30px] mb-[15px]">Auto-scrobbles</h3>
      <div className="my-[15px] mb-[30px]">These items are automatically scrobbled the next time they are scanned</div>
      {isPending ? (
        <Spinner size={30} className="my-[30px] mx-auto block" />
      ) : (
        <ul className="m-0 p-0 list-none mx-[-20px]">
          {!(data ?? []).length && (
            <div className="px-[40px] py-[10px] opacity-50 text-silver italic text-center">
              No entries found. Activate the option &quot;Auto-scrobble&quot; during your next scan.
            </div>
          )}
          {(data ?? []).map((item: any) => (
            <ProfileAutoScrobbleItem
              key={item.id}
              isDeleting={deletingIds.has(item.id)}
              onDelete={() => deleteMutation.mutate(item.id)}
              {...item}
            />
          ))}
        </ul>
      )}
    </>
  );
}
