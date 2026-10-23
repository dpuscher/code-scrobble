'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { FaCheckCircle, FaLastfm } from 'react-icons/fa';
import { IoMdQrScanner } from 'react-icons/io';
import CircleLayout, { CircleContent } from '../../../components/layout/CircleLayout';
import RoundButton from '../../../components/layout/RoundButton';
import Spinner from '../../../components/layout/Spinner';
import { ignoredReason } from '../../../lib/ignoredScrobbles';
import { describeSelection, nextParts, toSelection } from '../../../lib/parts';
import { sendScrobbles } from '../../../lib/scrobble';
import { scrobbledUrl } from '../../../lib/scrobbledUrl';
import type { Release } from '../../../lib/types';

/** What was scrobbled last. */
type Scrobbled = {
  /** Ids of the scrobbled parts; null for the default ones. */
  parts: string[] | null;
  /** Tracks Last.fm ignored, and its reason code. */
  ignored: number;
  reason: number | null;
};

type Props = Scrobbled & { barcode: string; release: Pick<Release, 'id' | 'image' | 'parts'> | null };

/** Confirms a scrobble and offers the next side or disc. */
const ScrobbledScreen = ({ barcode, release, ...props }: Props) => {
  const router = useRouter();
  // The next parts are scrobbled right here; this page then shows them.
  const [shown, setShown] = useState<Scrobbled>(props);
  const [round, setRound] = useState(0);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<{ title: string; description?: string } | null>(null);
  // Tracks of the next parts that reached Last.fm before a request failed.
  const resume = useRef(0);

  const releaseParts = release?.parts ?? [];
  const selection = toSelection(releaseParts, shown.parts);
  const scope = describeSelection(releaseParts, selection);
  const next = nextParts(releaseParts, selection);

  const scrobbleNext = async () => {
    if (!release || !next || sending) return;
    setSending(true);
    setFailure(null);
    const outcome = await sendScrobbles({ id: release.id, parts: next.selection, from: resume.current });
    if (outcome.status === 'login') {
      router.push('/login');
      return;
    }
    setSending(false);
    if (outcome.status === 'failed') {
      resume.current = outcome.sent;
      setFailure(outcome);
      return;
    }
    resume.current = 0;
    const scrobbled = { parts: next.selection, ignored: outcome.ignored?.count ?? 0, reason: outcome.ignored?.code ?? null };
    setShown(scrobbled);
    setRound((n) => n + 1);
    // Keeps the URL in step for reloads, without loading the page again.
    window.history.replaceState(null, '', scrobbledUrl(barcode, scrobbled.parts, outcome.ignored));
  };

  const { ignored, reason } = shown;
  let title = 'Record successfully scrobbled to Last.fm';
  if (scope) title = `${scope} scrobbled to Last.fm`;
  else if (ignored > 0) title = 'Record scrobbled to Last.fm';

  return (
    <CircleLayout>
      <CircleContent>
        {release?.image && (
          <div
            className="absolute -z-1 h-full w-full bg-cover opacity-50 blur-[20px] after:absolute after:inset-0 after:bg-dark/50"
            style={{ backgroundImage: `url("${release.image}")` }}
          />
        )}
        {/* Keyed, so that each scrobble pops in like the first. */}
        <div key={round} role="status" className="flex flex-col items-center">
          <FaCheckCircle size="50px" aria-hidden className="text-yellow motion-safe:animate-pop-in" />
          <div className="mx-[30px] mt-[30px] text-white motion-safe:animate-fade-in">
            <div className="font-normal">{title}</div>
            {ignored > 0 && (
              <p className="mt-2 text-[13px] text-silver">
                {`Last.fm ignored ${ignored} ${ignored === 1 ? 'track' : 'tracks'}.`}
                {' '}
                {ignoredReason(reason ?? undefined)}
              </p>
            )}
          </div>
        </div>
        {failure && (
          <p role="alert" className="mx-[30px] mt-2 text-[13px] text-silver motion-safe:animate-fade-in">
            {`${failure.title}.`}
            {failure.description && ` ${failure.description}`}
          </p>
        )}
        {next ? (
          <div className="-mb-[5%] mt-[8%] flex w-full">
            <RoundButton onClick={() => router.push('/')} className="mt-0! mb-0! flex-1 basis-0">
              <IoMdQrScanner size="30px" aria-hidden />
              Scan another
            </RoundButton>
            <RoundButton onClick={scrobbleNext} aria-busy={sending} className="mt-0! mb-0! flex-1 basis-0 aria-busy:active:scale-100">
              {/* The icon turns into a spinner, unless Last.fm answers right away. */}
              <span className="mb-[7px] grid size-[30px] *:col-start-1 *:row-start-1">
                <FaLastfm size="30px" aria-hidden className={`mb-0! ${sending ? 'animate-vanish-late' : ''}`} />
                {sending && <span className="animate-appear-late"><Spinner className="size-full" /></span>}
              </span>
              {next.label}
            </RoundButton>
          </div>
        ) : (
          <RoundButton onClick={() => router.push('/')} className="motion-safe:animate-fade-in">
            <IoMdQrScanner size="30px" aria-hidden />
            Scan another code
          </RoundButton>
        )}
      </CircleContent>
    </CircleLayout>
  );
};

export default ScrobbledScreen;
