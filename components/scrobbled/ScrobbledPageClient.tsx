"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdQrScanner } from "react-icons/io";
import { useRelease } from "../../client/hooks/useRelease";
import CircleLayout from "../layout/CircleLayout";
import { trackEvent } from "../../lib/analytics";

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
      <div className="absolute flex flex-col items-center justify-center w-full h-full p-[10%] text-center">
        {image && (
          <div
            className="absolute -z-10 inset-0 opacity-50 bg-cover blur-[20px]"
            style={{ backgroundImage: `url('${image}')` }}
          />
        )}
        <FaCheckCircle color="#feda6a" size="50px" />
        <div style={{ margin: "30px 30px 0" }}>Record sucessfully scrobbled to Last.fm</div>
        <button
          onClick={onRetry}
          className="flex flex-col items-center w-full mt-[10%] mb-[-5%] p-[5%] appearance-none border-0 bg-transparent text-inherit cursor-pointer"
        >
          <IoMdQrScanner size="30px" style={{ marginBottom: "7px" }} />
          Scan another code
        </button>
      </div>
    </CircleLayout>
  );
}
