export default function durationFormat(duration) {
  if (duration <= 0) return '';

  const hrs = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const secs = Math.floor(duration % 60);

  let ret = '';
  if (hrs > 0) ret += `${hrs}:${mins < 10 ? '0' : ''}`;
  ret += `${mins}:${secs < 10 ? '0' : ''}`;
  ret += `${secs}`;
  return ret;
}
