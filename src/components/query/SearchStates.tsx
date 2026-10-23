import type { ReactNode } from 'react';
import LogoIcon from '../icons/LogoIcon';
import NoResultsIcon from '../icons/NoResultsIcon';
import Loading from '../layout/Loading';

/** Centers a state in the space below the search field. */
export const Fallback = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">{children}</div>
);

export const Idle = () => (
  <Fallback>
    <LogoIcon color="#F4F4F4" className="h-auto w-1/2" />
    <p className="mt-5 text-sm text-dark/50">Search Discogs by artist and title</p>
  </Fallback>
);

export const Spinner = () => (
  <Fallback>
    <div className="relative h-0 w-full pb-[100%]"><Loading /></div>
  </Fallback>
);

type MessageProps = {
  title: string;
  action?: { label: string; onClick: () => void };
};

/** Empty or error state, with an optional way out. */
export const Message = ({ title, action }: MessageProps) => (
  <Fallback>
    <NoResultsIcon size={72} className="mb-5 opacity-80" />
    <p className="max-w-[260px] text-dark">{title}</p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-4 rounded-full bg-dark px-4 py-2 text-[13px] font-semibold text-white transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-95"
      >
        {action.label}
      </button>
    )}
  </Fallback>
);
