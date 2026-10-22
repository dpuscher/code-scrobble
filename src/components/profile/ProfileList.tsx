import type { ComponentProps } from 'react';

export const SectionHeading = (props: ComponentProps<'h3'>) => (
  <h3 className="mt-[30px] mb-[15px] text-[1.17em] font-bold" {...props} />
);

export const SectionMeta = (props: ComponentProps<'div'>) => (
  <div className="mt-[15px] mb-[30px]" {...props} />
);

/** Full-bleed list with a hairline between the entries. */
export const List = (props: ComponentProps<'ul'>) => <ul className="-mx-5" {...props} />;

export const ListItem = (props: ComponentProps<'li'>) => (
  <li className="flex items-center justify-between border-t border-grey px-5 last:border-b" {...props} />
);

export const Fallback = (props: ComponentProps<'li'>) => (
  <li className="px-10 py-2.5 text-center text-silver italic opacity-50" {...props} />
);
