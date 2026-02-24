import orderBy from "lodash/orderBy";
import pick from "lodash/pick";
import find from "lodash/find";
import * as Cache from "./cache";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const DiscogsClient = require("disconnect").Client;

interface DiscogsError {
  statusCode: number;
  message: string;
}

interface DiscogsArtist {
  name: string;
}

interface DiscogsTrack {
  type_: string;
  position: string;
  title: string;
  duration: string;
}

interface DiscogsIdentifier {
  type: string;
  value: string;
}

interface DiscogsData {
  artists?: DiscogsArtist[];
  title: string;
  images?: Array<{ uri: string }>;
  uri: string;
  year: string;
  tracklist?: DiscogsTrack[];
  identifiers?: DiscogsIdentifier[];
}

interface DiscogsSearchResult {
  id: number;
  community: { have: number; want: number };
}

export interface ReleaseData {
  id: number;
  artist: string;
  title: string;
  image: string | undefined;
  url: string;
  year: string;
  tracks: Array<{ title: string; trackNumber: number; duration: number }>;
  barcode: string | undefined;
}

export interface SearchResult {
  id: number;
  title: string;
  thumb: string;
  country: string;
  year: string;
  format: string;
  uri: string;
}

const Database = new DiscogsClient({
  consumerKey: process.env.DISCOGS_KEY,
  consumerSecret: process.env.DISCOGS_SECRET,
}).database();

const convertTimecode = (timecode: string | undefined): number => {
  if (!timecode) return 0;
  return timecode
    .split(":")
    .map(n => parseInt(n, 10) || 0)
    .reverse()
    .map((n, i) => n * 60 ** i)
    .reduce((pv, cv) => pv + cv);
};

const normalizeTracklist = (tracks: DiscogsTrack[]): DiscogsTrack[] => {
  const vinylPositionRegex = /^[A-Z]-?[0-9]+$/;
  // eslint-disable-next-line no-underscore-dangle
  let tracklist = tracks.filter(track => track.type_ === "track").filter(track => !/video/i.test(track.position));

  // Remove Bonus CDs from vinyl releases:
  if (tracklist.length && vinylPositionRegex.test(tracklist[0].position)) {
    const filteredTracks = tracklist.filter(track => vinylPositionRegex.test(track.position));
    if (filteredTracks.length !== tracklist.length) {
      tracklist = filteredTracks;
    }
  }

  return tracklist;
};

const getBarcode = (data: DiscogsIdentifier[] = []): string | undefined =>
  (find(data, { type: "Barcode" }) || {}).value;

const buildRelease = (id: number, data: DiscogsData): ReleaseData => ({
  id,
  artist: (data.artists || []).map(a => a.name).join(", "),
  title: data.title,
  image: data?.images?.[0]?.uri,
  url: data.uri,
  year: data.year,
  tracks: normalizeTracklist(data.tracklist || []).map((track, index) => ({
    title: track.title,
    trackNumber: index + 1,
    duration: convertTimecode(track.duration),
  })),
  barcode: getBarcode(data.identifiers),
});

export const barcode = (barcodeValue: string): Promise<number | undefined> =>
  new Promise(resolve => {
    const cacheKey = `barcode--${barcodeValue}`;

    Cache.get<number>(cacheKey)
      .then(result => {
        resolve(result);
      })
      .catch(() => {
        Database.search(
          undefined,
          { barcode: barcodeValue, type: "release" },
          (err: DiscogsError, data: { results: DiscogsSearchResult[] }) => {
            if (err || !data || !data.results || !data.results.length) {
              return resolve(undefined);
            }
            const results = orderBy(
              data.results,
              ["community.have", "community.want"],
              ["desc", "desc"],
            ) as DiscogsSearchResult[];

            Cache.set(cacheKey, results[0].id);

            return resolve(results[0].id);
          },
        );
      });
  });

export const search = (query: string): Promise<SearchResult[] | undefined> =>
  new Promise(resolve => {
    const cacheKey = `search--${query}`;

    Cache.get<SearchResult[]>(cacheKey)
      .then(results => {
        resolve(results);
      })
      .catch(() => {
        // eslint-disable-next-line consistent-return
        Database.search(query, { type: "release" }, (err: DiscogsError, data: { results: any[] }) => {
          if (err || !data || !data.results || !data.results.length) {
            return resolve(undefined);
          }

          const results: SearchResult[] = data.results.map(result =>
            pick(result, ["id", "title", "thumb", "country", "year", "format", "uri"]),
          );

          Cache.set(cacheKey, results);

          resolve(results);
        });
      });
  });

export const getRelease = (id: number): Promise<ReleaseData> =>
  new Promise((resolve, reject) => {
    Database.getRelease(id, (err: DiscogsError, data: DiscogsData) => {
      if (err) {
        if (err.statusCode === 404) {
          Database.getMaster(id, (masterErr: DiscogsError, masterData: DiscogsData) => {
            if (masterErr || !masterData) {
              reject(masterErr || new Error("No data returned from Discogs"));
            } else {
              resolve(buildRelease(id, masterData));
            }
          });
        } else {
          reject(err);
        }
      } else if (!data) {
        reject(new Error("No data returned from Discogs"));
      } else {
        resolve(buildRelease(id, data));
      }
    });
  });
