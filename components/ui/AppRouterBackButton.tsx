"use client";

import { useRouter } from "next/navigation";
import { MdChevronLeft } from "react-icons/md";

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
    <button
      onClick={handleClick}
      className="flex fixed top-0 left-0 items-center w-full p-[5px] overflow-hidden border-0 border-b border-silver bg-black/60 shadow-[0_0_3px_2px_black] backdrop-blur-[5px] text-[16px] text-silver cursor-pointer appearance-none font-inherit"
    >
      <MdChevronLeft color="#d4d4dc" size={40} />
      Back
    </button>
  );
}
