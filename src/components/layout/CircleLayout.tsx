import Link from 'next/link';
import { type ReactNode, ViewTransition } from 'react';
import LogoSmall from '../assets/LogoSmall';
import Session from '../session/Session';
import LegalLinks from '../ui/LegalLinks';

type Props = {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

/**
 * The app shell: logo and session on top, the round content area, footer.
 * Between screens the circle stays in place and its content crossfades;
 * header and footer content fade (styles in globals.css).
 */
const CircleLayout = ({ children, header, footer }: Props) => (
  <div data-scroll-lock className="flex h-full w-full items-center justify-center pt-[calc(15px+env(safe-area-inset-top))] pb-[calc(15px+env(safe-area-inset-bottom))]">
    <div className="flex h-full w-full flex-col justify-around">
      <div className="flex-1">
        <div className="absolute top-[calc(20px+env(safe-area-inset-top))] right-[calc(20px+env(safe-area-inset-right))] z-1">
          <Session />
        </div>
        <div className="absolute top-[calc(20px+env(safe-area-inset-top))] left-[calc(20px+env(safe-area-inset-left))] z-1 h-[8vw] max-h-[50px]">
          <Link href="/" aria-label="Scan" className="block h-full rounded-sm">
            <LogoSmall className="h-full w-auto" />
          </Link>
        </div>
        {header && <ViewTransition enter="fade" exit="fade" default="none">{header}</ViewTransition>}
      </div>
      <ViewTransition name="circle" share="circle" update="circle" default="none">
        <div className="relative mx-auto w-[500px] max-w-[80%] flex-none overflow-hidden rounded-full bg-grey shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_20px_60px_-20px_rgb(0_0_0/0.8)] [mask-image:radial-gradient(white,black)]">
          <div className="h-0 w-full pb-[100%]">
            {children}
          </div>
        </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col items-center justify-start">
        <LegalLinks />
        {footer && <ViewTransition enter="fade" exit="fade" default="none">{footer}</ViewTransition>}
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
