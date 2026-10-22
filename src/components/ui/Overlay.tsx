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
      className="fixed inset-0 z-1 flex items-center justify-center overflow-auto bg-black/70 backdrop-blur-[10px]"
    >
      <div
        className={`relative mx-5 mt-10 mb-5 flex w-full max-w-[600px] flex-col rounded-[3px] bg-white p-5 text-dark ${
          fullHeight ? 'h-[calc(100%-60px)]' : 'max-h-[calc(100%-60px)]'
        }`}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute -top-10 right-0 py-[5px] text-silver">
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
      className="absolute bottom-0 left-0 z-1 w-[15%] translate-y-full p-[2.5%] [&_svg]:h-auto [&_svg]:w-full"
    >
      {icon}
    </button>
    {children}
  </div>
);

export default Overlay;
