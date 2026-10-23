import type { ComponentProps } from 'react';

/** Icon-over-label text button used inside the round content area. */
const RoundButton = ({ className = '', ...props }: ComponentProps<'button'>) => (
  <button
    type="button"
    className={`-mb-[5%] mt-[10%] flex w-full flex-col items-center p-[5%] transition-transform duration-100 ease-out active:scale-95 [&_svg]:mb-[7px] ${className}`}
    {...props}
  />
);

export default RoundButton;
