'use client';

import { useRouter } from 'next/navigation';
import { BiChevronLeft } from 'react-icons/bi';

const BackButton = () => {
  const router = useRouter();
  // Go back within the app, but never "back" to another site.
  const goBack = () => {
    const cameFromApp = document.referrer
      && new URL(document.referrer).host === window.location.host;
    if (cameFromApp && window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="group fixed top-0 left-0 z-10 flex w-full items-center overflow-hidden border-b border-silver/30 bg-black/60 p-[5px] pt-[calc(5px+env(safe-area-inset-top))] pl-[calc(5px+env(safe-area-inset-left))] text-[16px] leading-[normal] shadow-[0_0_3px_2px_black] backdrop-blur-[5px]"
    >
      <BiChevronLeft size="40" aria-hidden className="text-silver transition-transform group-active:-translate-x-1" />
      Back
    </button>
  );
};

export default BackButton;
