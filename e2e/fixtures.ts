export const MOCK_PORT = 4010;
export const APP_PORT = 3100;

const svg = (color: string) => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="${color}"/></svg>`,
)}`;

export const MOCK_USER = {
  name: 'e2e-listener',
  sessionKey: 'mock-session-key',
  avatar: svg('#d51007'),
};

export const KNOWN_BARCODE = '4006381333931';
export const UNKNOWN_BARCODE = '5012345678900';

const track = (position: string, title: string, duration: string) => ({
  position, title, duration, type_: 'track',
});

export const fixtures = {
  releases: {
    1001: {
      id: 1001,
      master_id: 501,
      title: 'Night Drive',
      year: 2019,
      collected: 30,
      uri: 'https://www.discogs.com/release/1001-Night-Drive',
      artists: [{ name: 'The Testers' }],
      images: [{ uri: svg('#feda6a') }],
      identifiers: [{ type: 'Barcode', value: '4 006381 333931' }],
      tracklist: [
        track('A1', 'Headlights', '3:30'),
        track('A2', 'Overpass', '4:05'),
        { position: '', title: 'Side B', duration: '', type_: 'heading' },
        track('B1', 'Last Exit', '5:00'),
        track('CD1', 'Bonus Demo', '2:00'),
      ],
    },
    1002: {
      id: 1002,
      title: 'Quiet Hours',
      year: 2021,
      uri: 'https://www.discogs.com/release/1002-Quiet-Hours',
      artists: [{ name: 'The Testers' }],
      images: [{ uri: svg('#393f4d') }],
      identifiers: [{ type: 'Barcode', value: '0 75678 26432 9' }],
      tracklist: [
        track('1', 'Dawn', '2:10'),
        track('2', 'Noon', ''),
      ],
    },
    // The CD version of Night Drive.
    1003: {
      id: 1003,
      master_id: 501,
      title: 'Night Drive',
      year: 2020,
      uri: 'https://www.discogs.com/release/1003-Night-Drive',
      artists: [{ name: 'The Testers' }],
      images: [{ uri: svg('#d4d4dc') }],
      identifiers: [{ type: 'Barcode', value: '4 006381 333948' }],
      formats: ['CD', 'Album'],
      collected: 12,
      tracklist: [
        track('1', 'Headlights', '3:30'),
        track('2', 'Overpass', '4:05'),
        track('3', 'Last Exit', '5:00'),
      ],
    },
  } as Record<number, {
    id: number;
    master_id?: number;
    country?: string;
    label?: string;
    catno?: string;
    collected?: number;
    title: string;
    year: number;
    uri: string;
    artists: { name: string }[];
    images: { uri: string }[];
    identifiers: { type: string; value: string }[];
    formats?: string[];
    tracklist: { position: string; title: string; duration: string; type_: string }[];
  }>,
};
