import Image, { type ImageProps } from "next/image";

// Last.fm CDN fixed size buckets:
// 34s · 64s · 174s · 300x300
function lastfmSize(width: number): string {
  if (width <= 34) return "34s";
  if (width <= 64) return "64s";
  if (width <= 174) return "174s";
  return "300x300";
}

function lastfmLoader({ src, width }: { src: string; width: number }): string {
  const filename = src.split("/").pop();
  return `https://lastfm.freetls.fastly.net/i/u/${lastfmSize(width)}/${filename}`;
}

export default function LastFmImage(props: ImageProps) {
  return <Image loader={lastfmLoader} {...props} alt={props.alt ?? ""} />;
}
