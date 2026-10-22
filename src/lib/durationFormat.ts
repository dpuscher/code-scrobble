/** Formats seconds as m:ss or h:mm:ss; empty for unknown durations. */
export default function durationFormat(duration: number) {
  if (duration <= 0) return '';

  const hrs = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const secs = Math.floor(duration % 60);
  const pad = (n: number) => String(n).padStart(2, '0');

  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
}
