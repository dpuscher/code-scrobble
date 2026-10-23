/**
 * Made-up records for local development: served by the mock Discogs API
 * (`make up`) and used by dev/seed.ts to fill the profile.
 */

export type CatalogRelease = {
  id: number;
  artist: string;
  title: string;
  year: number;
  /** EAN-13, digits only. */
  barcode: string;
  format: string[];
  /** Cover gradient. */
  colors: [string, string];
  tracks: [title: string, duration: string][];
};

/** The Last.fm account the mock logs you in as during development. */
export const DEV_USER = {
  name: 'vinyl-fan',
  sessionKey: 'dev-session-key',
  avatar: `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#feda6a"/>'
    + '<text x="150" y="190" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="bold" fill="#1d1e22">VF</text></svg>',
  )}`,
};

/** Appends the EAN-13 check digit to 12 digits. */
function ean13(digits12: string) {
  const sum = [...digits12].reduce((total, d, i) => total + Number(d) * (i % 2 ? 3 : 1), 0);
  return `${digits12}${(10 - (sum % 10)) % 10}`;
}

const release = (
  id: number,
  artist: string,
  title: string,
  year: number,
  colors: [string, string],
  tracks: CatalogRelease['tracks'],
  format = ['Vinyl', 'LP', 'Album'],
): CatalogRelease => ({
  id, artist, title, year, colors, tracks, format, barcode: ean13(`40099${String(id).padStart(7, '0')}`),
});

export const catalog: CatalogRelease[] = [
  release(2001, 'Velvet Static', 'Neon Harbour', 1998, ['#ff6b6b', '#5f27cd'], [
    ['Low Tide', '4:12'], ['Harbour Lights', '3:48'], ['Signal Fire', '5:01'], ['Saltwater Radio', '3:22'],
    ['Breakwater', '4:40'], ['Last Ferry', '6:05'],
  ]),
  release(2002, 'Velvet Static', 'Paper Satellites', 2003, ['#48dbfb', '#0a3d62'], [
    ['Orbit', '3:31'], ['Paper Satellites', '4:02'], ['Gravity Well', '4:55'], ['Moonlit Static', '3:17'],
  ], ['CD', 'Album']),
  release(2003, 'Die Kassettenkinder', 'Rückspulen', 1994, ['#feca57', '#e15f41'], [
    ['Rückspulen', '3:05'], ['Bandsalat', '2:58'], ['Seite B', '4:10'], ['Walkman', '3:44'], ['Chromdioxid', '5:20'],
  ], ['CD', 'Album']),
  release(2004, 'Marlow & The Tides', 'Coastline Sessions', 2011, ['#1dd1a1', '#10ac84'], [
    ['Morning Swim', '2:49'], ['Coastline', '3:56'], ['Driftwood', '4:21'], ['Gulls', '1:58'], ['Undertow', '5:33'],
    ['Sandbar', '3:12'], ['Evening Swim', '4:45'],
  ]),
  release(2005, 'Hollow Pines', 'Winter Cabin', 2016, ['#c8d6e5', '#576574'], [
    ['Firewood', '3:40'], ['Snowblind', '4:18'], ['Pine Needles', '3:02'], ['Thaw', '6:12'],
  ]),
  release(2006, 'Kraftfeld', 'Spannung', 1982, ['#222f3e', '#ee5253'], [
    ['Spannung', '5:44'], ['Transistor', '4:31'], ['Hochfrequenz', '6:02'], ['Kurzschluss', '3:15'],
  ]),
  release(2007, 'Lucy Arcade', 'Bonus Level', 2019, ['#ff9ff3', '#f368e0'], [
    ['Insert Coin', '0:42'], ['Bonus Level', '3:21'], ['High Score', '3:04'], ['Continue?', '2:55'],
    ['Game Over (Not Really)', '4:12'],
  ], ['CD', 'EP']),
  release(2008, 'The Long Weekends', 'Sunday Again', 2008, ['#ff9f43', '#ee5253'], [
    ['Friday Feeling', '3:14'], ['Saturday Night Drive', '4:07'], ['Sunday Again', '3:52'], ['Monday Can Wait', '4:44'],
    ['Bank Holiday', '3:30'], ['Back to Work', '2:40'],
  ]),
  release(2009, 'Orchester der Stille', 'Nachtmusik', 2021, ['#341f97', '#0abde3'], [
    ['Ouvertüre', '7:12'], ['Mondlicht', '9:48'], ['Intermezzo', '2:30'], ['Morgengrauen', '11:05'],
  ]),
  release(2010, 'Sofa Kings', 'Living Room Tour', 2014, ['#10ac84', '#feca57'], [
    ['Couch Potato', '3:11'], ['Remote Control', '2:47'], ['Snack Break', '1:59'], ['Encore From The Kitchen', '4:36'],
  ], ['CD', 'Album', 'Live']),
  release(2011, 'Grey Matter Collective', 'Thinking Out Loud', 2005, ['#8395a7', '#222f3e'], [
    ['Cortex', '4:24'], ['Synapse', '3:58'], ['Neurons Firing', '5:13'], ['Daydream', '6:40'], ['Recall', '3:01'],
  ]),
  // A long name, to check that lists truncate it.
  release(2012, 'The Extraordinarily Long-Winded Name Ensemble', 'An Album Whose Title Simply Refuses To End Politely', 2023,
    ['#5f27cd', '#ff6b6b'], [['Prologue', '1:30'], ['The Middle Part, Which Is Also Long', '8:15'], ['Epilogue', '2:10']]),
];

/** Cover art as an SVG data URI, so nothing has to be downloaded. */
export function coverImage({ artist, title, colors: [from, to] }: CatalogRelease) {
  const escape = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="600" height="600" fill="url(#g)"/>
    <circle cx="420" cy="180" r="110" fill="#fff" fill-opacity=".12"/>
    <text x="40" y="500" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#fff" fill-opacity=".8">${escape(artist.slice(0, 32))}</text>
    <text x="40" y="550" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="bold" fill="#fff">${escape(title.slice(0, 22))}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The release as the Discogs API returns it. */
export function toDiscogs(r: CatalogRelease) {
  return {
    id: r.id,
    title: r.title,
    year: r.year,
    uri: `https://www.discogs.com/release/${r.id}`,
    artists: [{ name: r.artist }],
    images: [{ uri: coverImage(r) }],
    identifiers: [{ type: 'Barcode', value: r.barcode }],
    formats: r.format,
    tracklist: r.tracks.map(([title, duration], i) => ({
      position: String(i + 1), title, duration, type_: 'track',
    })),
  };
}
