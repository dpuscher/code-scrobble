import Link from 'next/link';
import type { ReactNode } from 'react';
import LogoSmall from '../assets/LogoSmall';
import Session from '../session/Session';
import LegalLinks from '../ui/LegalLinks';

type Props = {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

/** The app shell: logo and session on top, the round content area, footer. */
const CircleLayout = ({ children, header, footer }: Props) => (
  <div data-scroll-lock className="flex h-full w-full items-center justify-center py-[15px]">
    <div className="flex h-full w-full flex-col justify-around">
      <div className="flex-1">
        <div className="absolute top-5 right-5 z-1">
          <Session />
        </div>
        <div className="absolute top-5 left-5 z-1 h-[8vw] max-h-[50px]">
          <Link href="/" aria-label="Scan" className="block h-full">
            <LogoSmall className="h-full w-auto" />
          </Link>
        </div>
        {header}
      </div>
      <div className="relative mx-auto w-[500px] max-w-[80%] flex-none overflow-hidden rounded-full bg-grey [mask-image:radial-gradient(white,black)]">
        <div className="h-0 w-full pb-[100%]">
          {children}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-start">
        <LegalLinks />
        {footer}
      </div>
    </div>
  </div>
);

/** Centered column inside the round content area. */
export const CircleContent = ({ className = '', ...props }: React.ComponentProps<'div'>) => (
  <div
    className={`absolute flex h-full w-full flex-col items-center justify-center p-[10%] text-center ${className}`}
    {...props}
  />
);

/** Content below the circle, as wide as the circle. */
export const FooterContent = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto w-[500px] max-w-[80%] pt-5">{children}</div>
);

export default CircleLayout;
