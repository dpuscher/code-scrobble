"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdQrScanner } from "react-icons/io";
import { useRelease } from "../../client/hooks/useRelease";
import CircleLayout from "../layout/CircleLayout";
import { RetryButton } from "../layout/styles/Error.styles";
import { trackEvent } from "../../lib/analytics";
import { yellow } from "../../lib/colors";
import { FlexContent } from "../../styles/layout.styles";
import { CoverBackground } from "../../styles/scrobbled.styles";

interface ScrobbledPageClientProps {
  barcode: string;
}

export default function ScrobbledPageClient({ barcode }: ScrobbledPageClientProps) {
  const router = useRouter();
  const { data } = useRelease(barcode);

  const onRetry = () => {
    trackEvent("Scrobbled", "Rescan");
    router.push("/");
  };

  const image = data?.image;

  return (
    <CircleLayout>
      <FlexContent>
        {image && <CoverBackground image={image} />}
        <FaCheckCircle color={yellow} size="50px" />
        <div css="margin: 30px 30px 0">Record sucessfully scrobbled to Last.fm</div>
        <RetryButton onClick={onRetry}>
          <IoMdQrScanner size="30px" css="margin-bottom: 7px" />
          Scan another code
        </RetryButton>
      </FlexContent>
    </CircleLayout>
  );
}
