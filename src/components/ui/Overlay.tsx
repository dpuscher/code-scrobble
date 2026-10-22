import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { MdClose } from 'react-icons/md';

type Props = {
  label: string;
  onClose: () => void;
  fullHeight?: boolean;
  children: ReactNode;
};

/** Modal panel used for the release search and the release info. */
const Overlay = ({
  label, onClose, fullHeight = false, children,
}: Props) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-20 flex items-center justify-center overflow-auto overscroll-contain bg-black/70 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] backdrop-blur-[10px] motion-safe:animate-fade-in"
    >
      <div
        className={`relative mx-5 mt-10 mb-5 flex w-full max-w-[600px] flex-col rounded-xl bg-white p-5 text-dark shadow-2xl motion-safe:animate-pop-in ${
          fullHeight ? 'h-[calc(100%-60px)]' : 'max-h-[calc(100%-60px)]'
        }`}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute -top-10 right-0 rounded-full py-[5px] text-silver transition-[scale,color] duration-100 hover:text-white active:scale-90">
          <MdClose size="30" aria-hidden />
        </button>
        {children}
      </div>
    </div>
  );
};

/** Anchors the round icon button that opens an overlay, below the logo row. */
export const OverlayToggle = ({
  label, icon, onClick, children,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** The overlay, while open. */
  children?: ReactNode;
}) => (
  <div className="relative mx-auto h-full w-[500px] max-w-[80%]">
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute bottom-0 left-0 z-1 w-[15%] translate-y-full rounded-full p-[2.5%] transition-[scale,color] duration-100 ease-out hover:text-white active:scale-90 [&_svg]:h-auto [&_svg]:w-full"
    >
      {icon}
    </button>
    {children}
  </div>
);

export default Overlay;
