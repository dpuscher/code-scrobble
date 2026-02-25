"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ReleaseInfo from "../release/ReleaseInfo";
import Scrobble from "../scrobble/Scrobble";
import SearchRelease from "../release/SearchRelease";
import CircleLayout from "../layout/CircleLayout";
import { useRelease } from "../../client/hooks/useRelease";
import { trackEvent } from "../../lib/analytics";
import { FooterContent } from "../../styles/layout.styles";
import Checkbox from "../ui/Checkbox";

interface DetectedPageClientProps {
  barcode: string;
}

export default function DetectedPageClient({ barcode }: DetectedPageClientProps) {
  const router = useRouter();
  const { data } = useRelease(barcode);
  const [autoScrobble, setAutoScrobble] = useState(false);
  const [scrobbling, setScrobbling] = useState(false);

  const reScan = () => router.push("/");

  const scrobble = () => setScrobbling(true);

  const scrobbled = () => router.push(`/scrobbled/${barcode}`);

  const handleAutoScrobble = (value: boolean) => {
    if (value) trackEvent("Detected", "AutoScrobble");
    setAutoScrobble(value);
  };

  const showRelease = !scrobbling && data?.id;

  return (
    <CircleLayout
      footer={
        showRelease && (
          <FooterContent>
            <Checkbox name="autoScrobble" checked={autoScrobble} onChange={handleAutoScrobble}>
              Auto-scrobble on next scan
            </Checkbox>
          </FooterContent>
        )
      }
      header={showRelease && <ReleaseInfo release={data} />}
    >
      {scrobbling ? (
        <Scrobble release={data} autoScrobble={autoScrobble} onScrobbled={scrobbled} />
      ) : (
        <SearchRelease code={barcode} onScrobble={scrobble} onCancel={reScan} />
      )}
    </CircleLayout>
  );
}
