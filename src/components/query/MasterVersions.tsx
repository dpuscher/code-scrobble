import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useVersions } from '../../lib/api';
import type { SearchFormat } from '../../lib/formats';
import type { SearchResult, Version } from '../../lib/types';
import { Message, Spinner } from './SearchStates';
import ResultRow, { joinDetails, rowClass } from './ResultRow';

type Props = {
  album: SearchResult & { masterId: number };
  format: SearchFormat | null;
  onFormatChange: (format: SearchFormat | null) => void;
  onBack: () => void;
};

const SectionHeading = ({ children }: { children: string }) => (
  <h3 className="mt-3 mb-1 text-[11px] font-semibold tracking-wider text-dark/45 uppercase">{children}</h3>
);

const VersionLink = ({ version }: { version: Version }) => (
  <li>
    <Link href={`/detected/id:${version.id}`} className={rowClass}>
      <ResultRow
        thumb={version.thumb}
        title={[version.formats.join(' + '), version.format].filter(Boolean).join(' · ')}
        details={[
          joinDetails(version.year, version.country),
          joinDetails(version.label, version.catno),
        ]}
      />
    </Link>
  </li>
);

/** Second search step: picks the version of an album that is on the turntable. */
const MasterVersions = ({
  album, format, onFormatChange, onBack,
}: Props) => {
  const router = useRouter();
  const {
    data, error, isLoading, mutate,
  } = useVersions(album.masterId, format);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Only the first answer may skip this step; a filter changed here should not.
  const [initialFormat] = useState(format);
  const onlyVersion = format === initialFormat && !isLoading && data?.total === 1
    ? data.versions[0]
    : undefined;

  useEffect(() => headingRef.current?.focus(), []);

  const opened = useRef(false);
  useEffect(() => {
    if (!onlyVersion || opened.current) return;
    opened.current = true;
    router.push(`/detected/id:${onlyVersion.id}`);
  }, [onlyVersion, router]);

  let content;
  if (error && !isLoading) {
    content = (
      <Message title="Could not load the versions" action={{ label: 'Try again', onClick: () => mutate() }} />
    );
  } else if (!data || onlyVersion) {
    content = <Spinner />;
  } else if (!data.versions.length) {
    content = (
      <Message
        title={`No ${format} versions of this album`}
        action={{ label: 'Show all formats', onClick: () => onFormatChange(null) }}
      />
    );
  } else {
    const [mostCollected, ...others] = data.versions;
    const featured = others.length > 0 && mostCollected.collected > 0;
    content = (
      <div
        aria-busy={isLoading}
        className={`pb-3 transition-opacity duration-150 ${isLoading ? 'pointer-events-none opacity-40' : ''}`}
      >
        {featured && <SectionHeading>Most collected</SectionHeading>}
        <ul>
          <VersionLink version={mostCollected} />
        </ul>
        {featured && <SectionHeading>Other versions</SectionHeading>}
        <ul>
          {others.map((version) => <VersionLink key={version.id} version={version} />)}
        </ul>
        {data.total > data.versions.length && (
          <p className="px-4 pt-4 text-center text-[13px] text-dark/50">
            {`Showing ${data.versions.length} of ${data.total} versions.`}
            {!format && ' Choose a format to narrow them down.'}
          </p>
        )}
      </div>
    );
  }

  const count = data && !isLoading ? `${data.total} ${data.total === 1 ? 'version' : 'versions'}` : undefined;

  return (
    <div className="absolute inset-0 flex flex-col rounded-b-xl bg-white motion-safe:animate-slide-in">
      <div className="flex flex-none items-center gap-1 border-b border-black/10 py-2 pr-5 pl-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to results"
          className="flex size-10 flex-none items-center justify-center rounded-full text-dark/70 transition-[background-color,scale] duration-150 ease-out hover:bg-black/5 hover:text-dark active:scale-90"
        >
          <IoIosArrowBack size={24} aria-hidden />
        </button>
        <div className="min-w-0 grow">
          <h2 ref={headingRef} tabIndex={-1} className="truncate font-semibold text-dark outline-none">
            {album.title}
          </h2>
          <p className="truncate text-[13px] text-dark/60">{joinDetails(album.artist, count)}</p>
        </div>
      </div>
      <div className="flex min-h-0 grow flex-col overflow-auto overscroll-contain px-5">{content}</div>
    </div>
  );
};

export default MasterVersions;
