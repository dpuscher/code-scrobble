"use client";

import React, { useEffect } from "react";
import { FaLastfm } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useRelease } from "../../client/hooks/useRelease";
import Loading from "../layout/Loading";
import SearchReleaseError from "./SearchReleaseError";
import { Button, Poster, PosterContent } from "./styles/SearchRelease.styles";
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
    <Poster image={data?.image}>
      <PosterContent>
        <Button onClick={onCancel} {...autotrackParams("Detected", "Cancel")}>
          <MdClose size="40px" css="margin-bottom: 10px" />
          Cancel
        </Button>
        <Button onClick={onScrobble} {...autotrackParams("Detected", "Scrobble")}>
          <FaLastfm size="40px" css="margin-bottom: 10px" />
          Scrobble
        </Button>
      </PosterContent>
      {!data?.image && (
        <div>
          <b>{data?.artist}</b>
          <div>{data?.title}</div>
        </div>
      )}
    </Poster>
  );
}
