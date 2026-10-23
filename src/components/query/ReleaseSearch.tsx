import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { useSearch } from '../../lib/api';
import type { SearchFormat } from '../../lib/formats';
import type { SearchResult } from '../../lib/types';
import FormatFilter from './FormatFilter';
import MasterVersions from './MasterVersions';
import ResultRow, { joinDetails, rowClass } from './ResultRow';
import { Idle, Message, Spinner } from './SearchStates';

type Album = SearchResult & { masterId: number };

type Props = {
  format: SearchFormat | null;
  onFormatChange: (format: SearchFormat | null) => void;
};

/**
 * Release search: albums first, then the versions of the chosen album.
 * Releases without a Discogs master open directly.
 */
const ReleaseSearch = ({ format, onFormatChange }: Props) => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const {
    data, error, isLoading, mutate,
  } = useSearch(submitted, format);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    inputRef.current?.blur();
    setAlbum(null);
    setSubmitted(trimmed);
    resultsRef.current?.scrollTo({ top: 0 });
  };

  const closeAlbum = () => {
    const { masterId } = album ?? {};
    setAlbum(null);
    // Back where the user left off: the list kept its scroll position.
    requestAnimationFrame(() => {
      resultsRef.current?.querySelector<HTMLElement>(`[data-master="${masterId}"]`)?.focus({ preventScroll: true });
    });
  };

  let content;
  if (!submitted) {
    content = <Idle />;
  } else if (error && !isLoading) {
    content = <Message title="The search did not work" action={{ label: 'Try again', onClick: () => mutate() }} />;
  } else if (!data) {
    content = <Spinner />;
  } else if (!data.length) {
    content = format
      ? <Message title={`No ${format} releases were found`} action={{ label: 'Search all formats', onClick: () => onFormatChange(null) }} />
      : <Message title="No results were found for your query" />;
  } else {
    content = (
      <ul
        aria-busy={isLoading}
        className={`py-2 transition-opacity duration-150 ${isLoading ? 'pointer-events-none opacity-40' : ''}`}
      >
        {data.map((result) => {
          const { masterId } = result;
          const row = (
            <ResultRow
              thumb={result.thumb}
              title={result.title}
              details={[result.artist, joinDetails(result.year, result.country, result.format.join(', '))]}
              stacked={masterId !== null}
            />
          );
          return (
            <li key={masterId ? `master-${masterId}` : result.id}>
              {masterId === null ? (
                <Link href={`/detected/id:${result.id}`} className={rowClass}>{row}</Link>
              ) : (
                <button type="button" data-master={masterId} onClick={() => setAlbum({ ...result, masterId })} className={rowClass}>
                  {row}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        role="search"
        className="relative -mx-5 -mt-5 h-[46px] flex-[0_0_46px] overflow-hidden rounded-t-xl border-b border-black/10"
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
          className="h-full w-full py-2.5 pr-[45px] pl-[45px] text-center text-base/none font-normal outline-none placeholder:text-dark/40 [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" aria-label="Search" className="absolute top-0 right-0 flex h-[46px] w-[45px] items-center justify-center text-dark/70 transition-colors hover:text-dark">
          <IoIosSearch size={26} aria-hidden />
        </button>
      </form>
      <div className="flex-none pt-3 pb-1">
        <FormatFilter value={format} onChange={onFormatChange} />
      </div>
      <div className="relative -mx-5 -mb-5 min-h-0 flex-1">
        <div
          ref={resultsRef}
          inert={album !== null}
          className="absolute inset-0 flex flex-col overflow-auto overscroll-contain px-5"
        >
          {content}
        </div>
        {album && (
          <MasterVersions
            key={album.masterId}
            album={album}
            format={format}
            onFormatChange={onFormatChange}
            onBack={closeAlbum}
          />
        )}
      </div>
    </>
  );
};

export default ReleaseSearch;
