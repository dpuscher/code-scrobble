"use client";

import React, { useEffect } from "react";
import { FaLastfm } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useRelease } from "../../client/hooks/useRelease";
import Loading from "../layout/Loading";
import SearchReleaseError from "./SearchReleaseError";
import { autotrackParams } from "../../lib/analytics";

interface SearchReleaseProps {
  code: string;
  onScrobble: () => void;
  onCancel: () => void;
}

export default function SearchRelease({ code, onScrobble, onCancel }: SearchReleaseProps) {
  const { data, isPending, error } = useRelease(code);

  useEffect(() => {
    if (data?.instantScrobble) {
      onScrobble();
    }
  }, [data, onScrobble]);

  if (isPending) return <Loading />;

  if (error) {
    return <SearchReleaseError code={code} onRetry={onCancel} {...autotrackParams("Search", "Retry")} />;
  }

  return (
    <div
      className="flex absolute inset-0 flex-col items-center justify-end bg-cover"
      style={data?.image ? { backgroundImage: `url("${data.image}")` } : undefined}
    >
      <div className="flex w-full px-[20%] bg-black/50 text-center backdrop-blur-[10px]">
        <button
          onClick={onCancel}
          className="flex flex-col flex-grow items-center py-[12%] appearance-none border-0 bg-transparent text-inherit cursor-pointer"
          {...autotrackParams("Detected", "Cancel")}
        >
          <MdClose size="40px" style={{ marginBottom: "10px" }} />
          Cancel
        </button>
        <button
          onClick={onScrobble}
          className="flex flex-col flex-grow items-center py-[12%] appearance-none border-0 bg-transparent text-inherit cursor-pointer"
          {...autotrackParams("Detected", "Scrobble")}
        >
          <FaLastfm size="40px" style={{ marginBottom: "10px" }} />
          Scrobble
        </button>
      </div>
      {!data?.image && (
        <div>
          <b>{data?.artist}</b>
          <div>{data?.title}</div>
        </div>
      )}
    </div>
  );
}
