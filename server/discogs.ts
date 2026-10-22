import orderBy from "lodash/orderBy";
import find from "lodash/find";
import { Client as DiscogsClient } from "disconnect";
import { callbackToPromise } from "../lib/callbackToPromise";
import * as Cache from "./cache";

interface DiscogsError {
  statusCode?: number;
  message: string;
}

interface DiscogsArtist {
  name: string;
}

interface DiscogsReleaseTrack {
  type_?: string;
  position?: string;
  title?: string;
  duration?: string;
}

interface DiscogsIdentifier {
  type: string;
  value: string;
}

interface DiscogsData {
  artists?: DiscogsArtist[];
  title?: string;
  images?: Array<{ uri?: string }>;
  uri?: string;
  year?: string | number;
  tracklist?: DiscogsReleaseTrack[];
  identifiers?: DiscogsIdentifier[];
}

interface DiscogsSearchResult {
  id: number;
  community?: { have?: number; want?: number };
  title?: string;
  thumb?: string;
  country?: string;
  year?: string | number;
  format?: string | string[];
  uri?: string;
}

const isDiscogsError = (error: unknown): error is DiscogsError => Boolean(error && typeof error === "object" && "statusCode" in error);

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

type DatabaseSearchCallback = NonNullable<Parameters<typeof Database.search>[2]>;
type DatabaseGetReleaseCallback = NonNullable<Parameters<typeof Database.getRelease>[1]>;
type DatabaseGetMasterCallback = NonNullable<Parameters<typeof Database.getMaster>[1]>;

const convertTimecode = (timecode: string | undefined): number => {
  if (!timecode) return 0;
  return timecode
    .split(":")
    .map(n => Number.parseInt(n, 10) || 0)
    .toReversed()
    .map((n, i) => n * 60 ** i)
    .reduce((pv, cv) => pv + cv);
};

const normalizeTracklist = (tracks: DiscogsReleaseTrack[]): DiscogsReleaseTrack[] => {
  const vinylPositionRegex = /^[A-Z]-?[0-9]+$/;

  let tracklist = tracks
    .filter(track => (track.type_ ?? "") === "track")
    .filter(track => !/video/i.test(track.position ?? ""));

  // Remove Bonus CDs from vinyl releases:
  if (tracklist.length > 0 && vinylPositionRegex.test(tracklist[0].position ?? "")) {
    const filteredTracks = tracklist.filter(track => vinylPositionRegex.test(track.position ?? ""));
    if (filteredTracks.length !== tracklist.length) {
      tracklist = filteredTracks;
    }
  }

  return tracklist;
};

const getBarcode = (data: DiscogsIdentifier[] = []): string | undefined =>
  (find(data, { type: "Barcode" }) || {}).value?.replaceAll(/\s+/g, "");

const searchReleases = async (query: string | undefined, params: Record<string, unknown>): Promise<DiscogsSearchResult[] | undefined> => {
  const payload = await callbackToPromise((callback: DatabaseSearchCallback) => {
    Database.search(query, params, callback);
  });

  const results = payload?.results;
  if (!results || results.length === 0) {
    return;
  }

  return results;
};

const getReleaseById = (id: number): Promise<DiscogsData | undefined> =>
  callbackToPromise((callback: DatabaseGetReleaseCallback) => {
    Database.getRelease(id, callback);
  }) as Promise<DiscogsData | undefined>;

const getMasterById = (id: number): Promise<DiscogsData | undefined> =>
  callbackToPromise((callback: DatabaseGetMasterCallback) => {
    Database.getMaster(id, callback);
  }) as Promise<DiscogsData | undefined>;

const normalizeDiscogsError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown Discogs error");
};

const getDiscogsReleaseData = async (id: number): Promise<DiscogsData> => {
  try {
    const releaseData = await getReleaseById(id);
    if (releaseData) {
      return releaseData;
    }

    throw new Error("No data returned from Discogs");
  } catch (error) {
    if (isDiscogsError(error) && error.statusCode === 404) {
      const masterData = await getMasterById(id);
      if (masterData) {
        return masterData;
      }

      throw new Error("No data returned from Discogs");
    }

    throw normalizeDiscogsError(error);
  }
};

const buildRelease = (id: number, data: DiscogsData): ReleaseData => ({
  id,
  artist: (data.artists || []).map(a => a.name).join(", "),
  title: data.title ?? "",
  image: data?.images?.[0]?.uri,
  url: data.uri ?? "",
  year: data.year?.toString() ?? "",
  tracks: normalizeTracklist(data.tracklist || []).map((track, index) => ({
    title: track.title ?? "",
    trackNumber: index + 1,
    duration: convertTimecode(track.duration),
  })),
  barcode: getBarcode(data.identifiers),
});

export const barcode = async (barcodeValue: string): Promise<number | undefined> => {
  const cacheKey = `barcode--${barcodeValue}`;
  const cachedId = await Cache.get<number>(cacheKey);
  if (cachedId !== undefined) {
    return cachedId;
  }

  const results = await searchReleases(undefined, { barcode: barcodeValue, type: "release" });
  if (!results) {
    return;
  }

  const rankedResults = orderBy(
    results,
    [result => result.community?.have ?? 0, result => result.community?.want ?? 0],
    ["desc", "desc"],
  );

  const topResultId = rankedResults[0]?.id;
  if (topResultId === undefined) {
    return;
  }

  void Cache.set(cacheKey, topResultId);
  return topResultId;
};

export const search = async (query: string): Promise<SearchResult[] | undefined> => {
  const cacheKey = `search--${query}`;
  const cachedResults = await Cache.get<SearchResult[]>(cacheKey);
  if (cachedResults !== undefined) {
    return cachedResults;
  }

  const results = await searchReleases(query, { type: "release" });
  if (!results) {
    return;
  }

  const mappedResults: SearchResult[] = results.map(result => ({
    id: result.id,
    title: result.title ?? "",
    thumb: result.thumb ?? "",
    country: result.country ?? "",
    year: result.year?.toString() ?? "",
    format: Array.isArray(result.format) ? result.format.join(", ") : (result.format ?? ""),
    uri: result.uri ?? "",
  }));

  void Cache.set(cacheKey, mappedResults);
  return mappedResults;
};

export const getRelease = async (id: number): Promise<ReleaseData> => {
  const releaseData = await getDiscogsReleaseData(id);
  return buildRelease(id, releaseData);
};
