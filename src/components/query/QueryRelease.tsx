import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { searchReleases } from '../../lib/api';
import type { SearchResult } from '../../lib/types';
import LogoIcon from '../icons/LogoIcon';
import NoResultsIcon from '../icons/NoResultsIcon';
import Loading from '../layout/Loading';
import Overlay, { OverlayToggle } from '../ui/Overlay';

type Search = { status: 'idle' | 'loading' } | { status: 'done'; results: SearchResult[] };

const Fallback = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-1 flex-col items-center justify-center">{children}</div>
);

/** Search button that opens a Discogs release search, for unreadable barcodes. */
const QueryRelease = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState<Search>({ status: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);
  // Ignores responses to searches that were superseded or closed.
  const requestId = useRef(0);

  const show = () => {
    setQuery('');
    setSearch({ status: 'idle' });
    setOpen(true);
  };

  const close = () => {
    requestId.current += 1;
    setOpen(false);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    inputRef.current?.blur();
    const id = ++requestId.current;
    setSearch({ status: 'loading' });
    const results = await searchReleases(query).catch(() => []);
    if (id === requestId.current) {
      setSearch({ status: 'done', results: Array.isArray(results) ? results : [] });
    }
  };

  let content = <Fallback><LogoIcon color="#F4F4F4" className="h-auto w-1/2" /></Fallback>;
  if (search.status === 'loading') {
    content = <Fallback><div className="relative h-0 w-full pb-[100%]"><Loading /></div></Fallback>;
  } else if (search.status === 'done' && search.results.length) {
    content = (
      <div className="overflow-auto pt-2.5">
        {search.results.map(({
          id, title, thumb, country, year, format,
        }) => (
          <Link key={id} href={`/detected/id:${id}`} className="mb-2.5 flex w-full text-dark">
            <div className="mr-2.5 block size-[60px] flex-[0_0_60px]">
              {thumb && <img src={thumb} alt="" width={60} height={60} loading="lazy" className="size-[60px] object-cover" />}
            </div>
            <div className="flex grow flex-col">
              <div className="max-h-[2.3em] overflow-hidden font-semibold">
                {title}
                {year && ` (${year})`}
              </div>
              <div className="mt-2 h-[1.15em] overflow-hidden text-[13px]">
                {[country, format?.join(', ')].filter(Boolean).join(' · ')}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  } else if (search.status === 'done') {
    content = (
      <Fallback>
        <div className="text-center">
          <NoResultsIcon className="mx-auto mb-5 block" />
          No results were found
          <br />
          for your query
        </div>
      </Fallback>
    );
  }

  return (
    <OverlayToggle label="Search release" icon={<IoIosSearch aria-hidden />} onClick={show}>
      {open && (
        <Overlay label="Search release" onClose={close} fullHeight>
          <form
            onSubmit={onSubmit}
            role="search"
            className="relative -mx-5 -mt-5 h-[38px] flex-[0_0_38px] overflow-hidden border-b border-dark"
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search release..."
              aria-label="Search release"
              enterKeyHint="search"
              autoFocus
              className="w-full rounded-[3px] py-2.5 pr-[45px] pl-2.5 text-center text-base/none font-normal"
            />
            <button type="submit" aria-label="Search" className="absolute top-0 right-0 flex h-[38px] w-[45px] items-center justify-center">
              <IoIosSearch size={30} aria-hidden />
            </button>
          </form>
          {content}
        </Overlay>
      )}
    </OverlayToggle>
  );
};

export default QueryRelease;
