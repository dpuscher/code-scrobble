import type { ComponentProps, ReactNode } from 'react';

export const SectionHeading = (props: ComponentProps<'h3'>) => (
  <h3 className="mt-10 mb-1 text-[1.17em] font-bold" {...props} />
);

export const SectionMeta = (props: ComponentProps<'p'>) => (
  <p className="mb-4 opacity-60" {...props} />
);

/**
 * Hairline-separated list: edge to edge on phones, a bordered card on
 * wider screens.
 */
export const List = (props: ComponentProps<'ul'>) => (
  <ul
    className="-mx-5 divide-y divide-grey border-y border-grey sm:mx-0 sm:overflow-hidden sm:rounded-xl sm:border"
    {...props}
  />
);

export const ListItem = (props: ComponentProps<'li'>) => <li className="flex items-center" {...props} />;

/** One entry: cover art, title, and a line of details. */
export const Row = ({
  image, title, details, className = '', ...props
}: { image: string | null; title: ReactNode; details: ReactNode } & ComponentProps<'div'>) => (
  <div className={`flex min-w-0 grow items-center gap-3 py-2.5 pl-5 ${className}`} {...props}>
    <span className="block size-10 flex-none overflow-hidden rounded-sm bg-grey">
      {image && <img src={image} alt="" width={40} height={40} loading="lazy" className="size-full object-cover" />}
    </span>
    <span className="min-w-0 grow">
      <span className="block truncate font-normal text-white/90">{title}</span>
      <span className="block truncate text-[13px] opacity-60">{details}</span>
    </span>
  </div>
);

export const Fallback = (props: ComponentProps<'li'>) => (
  <li className="px-10 py-4 text-center text-silver italic opacity-50" {...props} />
);
