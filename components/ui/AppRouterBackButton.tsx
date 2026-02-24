"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "styled-icons/boxicons-regular";
import { silver } from "../../lib/colors";
import { Button } from "./styles/BackButton.styles";

const getHostFromUrl = (url: string) => (/\/\/([^/]+)\//i.exec(url) || [])[1];

const hasExternalReferrer = () => {
  if (!document.referrer) return true;
  return getHostFromUrl(document.referrer) !== getHostFromUrl(window.location.href);
};

export default function AppRouterBackButton() {
  const router = useRouter();

  const handleClick = () => {
    if (hasExternalReferrer()) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <Button onClick={handleClick}>
      <ChevronLeft color={silver} size="40" />
      Back
    </Button>
  );
}
