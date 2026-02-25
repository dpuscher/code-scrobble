"use client";

import React from "react";
import { useHistory } from "../../client/hooks/useHistory";
import ProfileHistoryItem from "./ProfileHistoryItem";
import Spinner from "../layout/Spinner";

export default function ProfileHistory() {
  const { data: history, isPending } = useHistory();

  return (
    <>
      <h3 className="mt-[30px] mb-[15px]">History</h3>
      <div className="my-[15px] mb-[30px]">Your recently scanned items. Tap one to scrobble it again.</div>
      {isPending ? (
        <Spinner size={30} className="my-[30px] mx-auto block" />
      ) : (
        <ul className="m-0 p-0 list-none mx-[-20px]">
          {!(history ?? []).length && (
            <div className="px-[40px] py-[10px] opacity-50 text-silver italic text-center">No entries found.</div>
          )}
          {(history ?? []).map((item: any) => (
            <ProfileHistoryItem key={item.id} {...item} />
          ))}
        </ul>
      )}
    </>
  );
}
