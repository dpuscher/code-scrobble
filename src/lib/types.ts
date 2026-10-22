// Shapes of the JSON API responses (see src/pages/api).

export type Session = {
  id: number;
  name: string;
  url: string | null;
  image: string | null;
  imageLarge: string | null;
  imageXLarge: string | null;
};

export type Track = {
  title: string;
  trackNumber: number;
  duration: number;
};

export type Release = {
  id: number;
  artist: string;
  title: string;
  image: string | null;
  url: string | null;
  year: string | null;
  tracks: Track[];
  instantScrobble: boolean;
};

export type SearchResult = {
  id: number;
  title: string;
  thumb?: string;
  country?: string;
  year?: string;
  format?: string[];
};

export type HistoryItem = {
  id: number;
  time: string;
  artist: string;
  title: string;
  year: string | null;
  barcode: string | null;
  discogsId: number;
};

export type AutoScrobble = {
  id: number;
  artist: string;
  title: string;
  year: string | null;
};
