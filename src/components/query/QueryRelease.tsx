import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { searchReleases } from '../../lib/api';
import type { SearchResult } from '../../lib/types';
import NoResultsIcon from '../icons/NoResultsIcon';
import Loading from '../layout/Loading';
import Overlay from '../ui/Overlay';
import { ToggleButton, ToggleWrapper } from '../ui/styles/Overlay.styles';
import {
  FallbackIcon, FallbackWrapper, HeadWrapper, Input, LoadingWrapper, Meta, NoResults, Result,
  ResultInfo, ResultWrapper, Submit, Thumbnail, ThumbnailWrapper, Title,
} from './styles/QueryRelease.styles';

type Search = { status: 'idle' | 'loading' } | { status: 'done'; results: SearchResult[] };

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

  let content = <FallbackWrapper><FallbackIcon color="#F4F4F4" /></FallbackWrapper>;
  if (search.status === 'loading') {
    content = <FallbackWrapper><LoadingWrapper><Loading /></LoadingWrapper></FallbackWrapper>;
  } else if (search.status === 'done' && search.results.length) {
    content = (
      <ResultWrapper>
        {search.results.map(({
          id, title, thumb, country, year, format,
        }) => (
          <Result key={id} as={Link} href={`/detected/id:${id}`}>
            <ThumbnailWrapper>
              {thumb && <Thumbnail src={thumb} alt="" width={60} height={60} loading="lazy" />}
            </ThumbnailWrapper>
            <ResultInfo>
              <Title>
                {title}
                {year && ` (${year})`}
              </Title>
              <Meta>
                {[country, format?.join(', ')].filter(Boolean).join(' · ')}
              </Meta>
            </ResultInfo>
          </Result>
        ))}
      </ResultWrapper>
    );
  } else if (search.status === 'done') {
    content = (
      <FallbackWrapper>
        <NoResults>
          <NoResultsIcon />
          No results were found
          <br />
          for your query
        </NoResults>
      </FallbackWrapper>
    );
  }

  return (
    <ToggleWrapper>
      <ToggleButton type="button" onClick={show} aria-label="Search release">
        <IoIosSearch aria-hidden />
      </ToggleButton>
      {open && (
        <Overlay label="Search release" onClose={close} fullHeight>
          <HeadWrapper onSubmit={onSubmit} role="search">
            <Input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search release..."
              aria-label="Search release"
              enterKeyHint="search"
              autoFocus
            />
            <Submit type="submit" aria-label="Search">
              <IoIosSearch size={30} aria-hidden />
            </Submit>
          </HeadWrapper>
          {content}
        </Overlay>
      )}
    </ToggleWrapper>
  );
};

export default QueryRelease;
