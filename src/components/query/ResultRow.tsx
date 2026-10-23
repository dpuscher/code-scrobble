import type { ReactNode } from 'react';
import { IoIosArrowForward } from 'react-icons/io';

/** Classes for the link or button wrapping a ResultRow. */
export const rowClass = '-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-lg p-2 text-left text-dark transition-[background-color,scale] duration-150 ease-out hover:bg-black/5 active:scale-[0.99] active:bg-black/10';

type Props = {
  thumb?: string;
  title: ReactNode;
  /** Secondary lines; empty ones are left out. */
  details: (string | undefined)[];
  /** Draws a stack of covers and a chevron: the row opens a list of versions. */
  stacked?: boolean;
};

/** Cover, bold title and up to two lines of details. */
const ResultRow = ({
  thumb, title, details, stacked = false,
}: Props) => (
  <>
    <span
      className={`relative block size-[60px] flex-none ${
        stacked ? 'before:absolute before:inset-0 before:translate-x-[3px] before:-translate-y-[3px] before:rounded-md before:bg-black/10' : ''
      }`}
    >
      <span className="relative block size-full overflow-hidden rounded-md bg-silver">
        {thumb && <img src={thumb} alt="" width={60} height={60} loading="lazy" className="size-full object-cover" />}
      </span>
    </span>
    <span className="min-w-0 grow">
      <span className="line-clamp-2 leading-snug font-semibold">{title}</span>
      {details.filter(Boolean).map((line) => (
        <span key={line} className="mt-0.5 block truncate text-[13px] text-dark/60">{line}</span>
      ))}
    </span>
    {stacked && <IoIosArrowForward size={18} aria-hidden className="flex-none text-dark/30" />}
  </>
);

export const joinDetails = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ') || undefined;

export default ResultRow;
