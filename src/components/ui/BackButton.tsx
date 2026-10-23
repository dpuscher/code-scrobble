import Router from 'next/router';
import { BiChevronLeft } from 'react-icons/bi';

// Go back within the app, but never "back" to another site.
function handleClick() {
  const cameFromApp = document.referrer
    && new URL(document.referrer).host === window.location.host;
  if (cameFromApp && window.history.length > 1) Router.back();
  else Router.push('/');
}

const BackButton = () => (
  <button
    type="button"
    onClick={handleClick}
    className="group fixed top-0 left-0 z-10 flex w-full items-center overflow-hidden border-b border-silver/30 bg-black/60 p-[5px] pt-[calc(5px+env(safe-area-inset-top))] pl-[calc(5px+env(safe-area-inset-left))] text-[16px] leading-[normal] shadow-[0_0_3px_2px_black] backdrop-blur-[5px]"
  >
    <BiChevronLeft size="40" aria-hidden className="text-silver transition-transform group-active:-translate-x-1" />
    Back
  </button>
);

export default BackButton;
