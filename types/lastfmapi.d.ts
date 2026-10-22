declare module "lastfmapi" {
  type LastfmCallback<T = unknown> = (error: Error | null, result?: T) => void;
  type LastfmBoolean = boolean | 0 | 1 | "0" | "1";
  type LastfmNumber = number | `${number}`;
  type LastfmMaybeArray<T> = T | T[];

  interface LastfmApiOptions {
    api_key?: string;
    secret?: string;
    [key: string]: unknown;
  }

  interface LastfmSessionCredentials {
    username: string;
    key: string;
  }

  interface LastfmRequestParams {
    [key: string]: unknown;
  }

  interface LastfmRequestOptions extends LastfmRequestParams {
    handlers?: {
      success?: (response: unknown) => void;
      error?: (error: Error) => void;
    };
  }

  interface LastfmNodeLike {
    api_key?: string;
    request(method: string, options: LastfmRequestOptions): void;
    [key: string]: unknown;
  }

  interface PaginationParams {
    page?: number;
    limit?: number;
    [key: string]: unknown;
  }

  interface TimeRangeParams {
    from?: number | string;
    to?: number | string;
    [key: string]: unknown;
  }

  interface PeriodParams {
    period?: "overall" | "7day" | "1month" | "3month" | "6month" | "12month" | string;
    [key: string]: unknown;
  }

  interface LastfmWiki {
    published?: string;
    summary?: string;
    content?: string;
    links?: {
      link?: {
        "#text"?: string;
        rel?: string;
        href?: string;
      };
    };
    [key: string]: unknown;
  }

  interface LastfmImage {
    "#text": string;
    size?: "small" | "medium" | "large" | "extralarge" | "mega" | string;
  }

  interface LastfmDate {
    uts?: string;
    "#text"?: string;
  }

  interface LastfmEntityAttr {
    rank?: LastfmNumber;
    nowplaying?: LastfmBoolean;
    [key: string]: string | number | boolean | undefined;
  }

  interface LastfmPaginationAttr {
    page?: LastfmNumber;
    perPage?: LastfmNumber;
    perpage?: LastfmNumber;
    totalPages?: LastfmNumber;
    totalpages?: LastfmNumber;
    total?: LastfmNumber;
    user?: string;
    artist?: string;
    album?: string;
    track?: string;
    tag?: string;
    country?: string;
    from?: LastfmNumber;
    to?: LastfmNumber;
    type?: string;
    [key: string]: string | number | undefined;
  }

  type LastfmStreamable =
    | LastfmBoolean
    | {
        "#text"?: LastfmBoolean | string;
        fulltrack?: LastfmBoolean | string;
      };

  interface LastfmTextValue {
    "#text"?: string;
    mbid?: string;
    [key: string]: unknown;
  }

  interface LastfmTag {
    name: string;
    url?: string;
    count?: LastfmNumber;
    reach?: LastfmNumber;
    taggings?: LastfmNumber;
    streamable?: LastfmStreamable;
    wiki?: LastfmWiki;
    [key: string]: unknown;
  }

  interface LastfmArtistSummary {
    name: string;
    mbid?: string;
    url?: string;
    image?: LastfmImage[] | string;
    streamable?: LastfmStreamable;
    listeners?: LastfmNumber;
    playcount?: LastfmNumber;
    userplaycount?: LastfmNumber;
    match?: LastfmNumber;
    [key: string]: unknown;
  }

  interface LastfmAlbumSummary {
    name: string;
    mbid?: string;
    url?: string;
    artist?: string | LastfmArtistSummary;
    image?: LastfmImage[];
    listeners?: LastfmNumber;
    playcount?: LastfmNumber;
    [key: string]: unknown;
  }

  interface LastfmTrackSummary {
    name?: string;
    title?: string;
    mbid?: string;
    url?: string;
    duration?: LastfmNumber;
    listeners?: LastfmNumber;
    playcount?: LastfmNumber;
    streamable?: LastfmStreamable;
    artist?: string | LastfmArtistSummary | LastfmTextValue;
    image?: LastfmImage[];
    date?: LastfmDate;
    loved?: LastfmBoolean;
    match?: LastfmNumber;
    "@attr"?: LastfmEntityAttr;
    [key: string]: unknown;
  }

  interface LastfmUserProfile {
    id?: LastfmNumber;
    name: string;
    realname?: string;
    url?: string;
    image?: LastfmImage[];
    country?: string;
    age?: LastfmNumber | string;
    gender?: string;
    subscriber?: LastfmBoolean;
    playcount?: LastfmNumber;
    playlists?: LastfmNumber;
    bootstrap?: LastfmBoolean;
    registered?: {
      unixtime?: LastfmNumber;
      "#text"?: string;
    };
    type?: string;
    [key: string]: unknown;
  }

  interface LastfmArtistInfo extends LastfmArtistSummary {
    ontour?: LastfmBoolean;
    stats?: {
      listeners?: LastfmNumber;
      playcount?: LastfmNumber;
      userplaycount?: LastfmNumber;
    };
    similar?: {
      artist?: LastfmMaybeArray<LastfmArtistSummary>;
    };
    tags?: {
      tag?: LastfmMaybeArray<LastfmTag>;
    };
    bio?: LastfmWiki;
  }

  interface LastfmAlbumTrack extends LastfmTrackSummary {
    artist?: string | LastfmArtistSummary;
    "@attr"?: {
      rank?: LastfmNumber;
      [key: string]: string | number | undefined;
    };
  }

  interface LastfmAlbumInfo extends LastfmAlbumSummary {
    id?: LastfmNumber;
    artist: string;
    releasedate?: string;
    userplaycount?: LastfmNumber;
    tracks?: {
      track?: LastfmMaybeArray<LastfmAlbumTrack>;
    };
    toptags?: {
      tag?: LastfmMaybeArray<LastfmTag>;
    };
    tags?: {
      tag?: LastfmMaybeArray<LastfmTag>;
    };
    wiki?: LastfmWiki;
  }

  interface LastfmTrackInfo extends LastfmTrackSummary {
    id?: LastfmNumber;
    album?: {
      artist?: string;
      title?: string;
      mbid?: string;
      image?: LastfmImage[];
      "@attr"?: {
        position?: LastfmNumber;
        [key: string]: string | number | undefined;
      };
    };
    userplaycount?: LastfmNumber;
    userloved?: LastfmBoolean;
    toptags?: {
      tag?: LastfmMaybeArray<LastfmTag>;
    };
    wiki?: LastfmWiki;
  }

  interface LastfmTagsResponse {
    tag?: LastfmMaybeArray<LastfmTag>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmTopTagsResponse {
    tag?: LastfmMaybeArray<LastfmTag>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmArtistsPageResponse {
    artist?: LastfmMaybeArray<LastfmArtistSummary>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmAlbumsPageResponse {
    album?: LastfmMaybeArray<LastfmAlbumSummary>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmTracksPageResponse {
    track?: LastfmMaybeArray<LastfmTrackSummary>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmTrackCorrection {
    track?: LastfmTrackSummary;
    "@attr"?: {
      index?: LastfmNumber;
      artistcorrected?: LastfmBoolean;
      trackcorrected?: LastfmBoolean;
      [key: string]: string | number | boolean | undefined;
    };
  }

  interface LastfmTrackCorrectionsResponse {
    correction?: LastfmMaybeArray<LastfmTrackCorrection>;
  }

  interface LastfmArtistCorrection {
    artist?: LastfmArtistSummary;
    "@attr"?: {
      index?: LastfmNumber;
      [key: string]: string | number | undefined;
    };
  }

  interface LastfmArtistCorrectionsResponse {
    correction?: LastfmMaybeArray<LastfmArtistCorrection>;
  }

  interface LastfmSimilarArtistsResponse {
    artist?: LastfmMaybeArray<LastfmArtistSummary>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmSimilarTracksResponse {
    track?: LastfmMaybeArray<LastfmTrackSummary>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmSimilarTagsResponse {
    tag?: LastfmMaybeArray<LastfmTag>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmSearchMeta {
    "opensearch:Query"?: {
      "#text"?: string;
      role?: string;
      searchTerms?: string;
      startPage?: LastfmNumber;
      [key: string]: unknown;
    };
    "opensearch:totalResults"?: LastfmNumber;
    "opensearch:startIndex"?: LastfmNumber;
    "opensearch:itemsPerPage"?: LastfmNumber;
    "@attr"?: {
      for?: string;
      [key: string]: unknown;
    };
  }

  interface LastfmAlbumSearchResults extends LastfmSearchMeta {
    albummatches?: {
      album?: LastfmMaybeArray<LastfmAlbumSummary>;
    };
  }

  interface LastfmArtistSearchMatch extends LastfmArtistSummary {
    image_small?: string;
    image?: string;
  }

  interface LastfmArtistSearchResults extends LastfmSearchMeta {
    artistmatches?: {
      artist?: LastfmMaybeArray<LastfmArtistSearchMatch>;
    };
  }

  interface LastfmTrackSearchMatch extends LastfmTrackSummary {
    artist?: string;
  }

  interface LastfmTrackSearchResults extends LastfmSearchMeta {
    trackmatches?: {
      track?: LastfmMaybeArray<LastfmTrackSearchMatch>;
    };
  }

  interface LastfmIgnoredMessage {
    "#text"?: string;
    code?: LastfmNumber;
    [key: string]: unknown;
  }

  interface LastfmCorrectedText {
    "#text"?: string;
    corrected?: LastfmBoolean;
  }

  interface LastfmScrobble {
    track?: string | LastfmCorrectedText;
    artist?: string | LastfmCorrectedText;
    album?: string | LastfmCorrectedText;
    albumArtist?: string | LastfmCorrectedText;
    timestamp?: LastfmNumber;
    ignoredMessage?: LastfmIgnoredMessage;
    [key: string]: unknown;
  }

  interface LastfmScrobblesResponse {
    "@attr"?: {
      accepted?: LastfmNumber;
      ignored?: LastfmNumber;
      [key: string]: string | number | undefined;
    };
    scrobble?: LastfmMaybeArray<LastfmScrobble>;
  }

  interface LastfmNowPlayingResponse {
    track?: string | LastfmCorrectedText;
    artist?: string | LastfmCorrectedText;
    album?: string | LastfmCorrectedText;
    albumArtist?: string | LastfmCorrectedText;
    ignoredMessage?: LastfmIgnoredMessage;
    [key: string]: unknown;
  }

  interface LastfmTaggingsResponse {
    artists?: {
      artist?: LastfmMaybeArray<LastfmArtistSummary>;
    };
    albums?: {
      album?: LastfmMaybeArray<LastfmAlbumSummary>;
    };
    tracks?: {
      track?: LastfmMaybeArray<LastfmTrackSummary>;
    };
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmFriendsResponse {
    user?: LastfmMaybeArray<LastfmUserProfile>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmRecentTracksResponse {
    track?: LastfmMaybeArray<LastfmTrackSummary>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmWeeklyChartEntry {
    from?: LastfmNumber;
    to?: LastfmNumber;
    [key: string]: unknown;
  }

  interface LastfmWeeklyChartListResponse {
    chart?: LastfmMaybeArray<LastfmWeeklyChartEntry>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmWeeklyAlbumChartItem {
    artist?: string | LastfmTextValue;
    name?: string;
    mbid?: string;
    playcount?: LastfmNumber;
    url?: string;
    "@attr"?: LastfmEntityAttr;
    [key: string]: unknown;
  }

  interface LastfmWeeklyArtistChartItem extends LastfmArtistSummary {
    playcount?: LastfmNumber;
    "@attr"?: LastfmEntityAttr;
  }

  interface LastfmWeeklyTrackChartItem extends LastfmTrackSummary {
    artist?: string | LastfmTextValue;
    playcount?: LastfmNumber;
    "@attr"?: LastfmEntityAttr;
  }

  interface LastfmWeeklyAlbumChartResponse {
    album?: LastfmMaybeArray<LastfmWeeklyAlbumChartItem>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmWeeklyArtistChartResponse {
    artist?: LastfmMaybeArray<LastfmWeeklyArtistChartItem>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmWeeklyTrackChartResponse {
    track?: LastfmMaybeArray<LastfmWeeklyTrackChartItem>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmArtistTracksResponse {
    track?: LastfmMaybeArray<LastfmTrackSummary>;
    "@attr"?: LastfmPaginationAttr;
  }

  interface LastfmWriteResponse {
    [key: string]: unknown;
  }

  type ArtistReferenceParams =
    | {
        mbid: string;
        artist?: string;
      }
    | {
        artist: string;
        mbid?: string;
      };

  type AlbumReferenceParams =
    | {
        mbid: string;
        artist?: string;
        album?: string;
      }
    | {
        artist: string;
        album: string;
        mbid?: string;
      };

  type TrackReferenceParams =
    | {
        mbid: string;
        artist?: string;
        track?: string;
      }
    | {
        artist: string;
        track: string;
        mbid?: string;
      };

  type AlbumGetInfoParams = AlbumReferenceParams & {
    lang?: string;
    autocorrect?: LastfmBoolean;
    username?: string;
    [key: string]: unknown;
  };

  type AlbumGetTagsParams = AlbumReferenceParams & {
    user?: string;
    autocorrect?: LastfmBoolean;
    [key: string]: unknown;
  };

  type AlbumGetTopTagsParams = AlbumReferenceParams & {
    autocorrect?: LastfmBoolean;
    [key: string]: unknown;
  };

  interface AlbumSearchParams extends PaginationParams {
    album: string;
    [key: string]: unknown;
  }

  type ArtistGetInfoParams = ArtistReferenceParams & {
    lang?: string;
    autocorrect?: LastfmBoolean;
    username?: string;
    [key: string]: unknown;
  };

  type ArtistGetSimilarParams = ArtistReferenceParams &
    PaginationParams & {
      autocorrect?: LastfmBoolean;
      [key: string]: unknown;
    };

  type ArtistGetTagsParams = ArtistReferenceParams & {
    user?: string;
    autocorrect?: LastfmBoolean;
    [key: string]: unknown;
  };

  type ArtistTopListParams = ArtistReferenceParams &
    PaginationParams & {
      autocorrect?: LastfmBoolean;
      [key: string]: unknown;
    };

  interface ArtistSearchParams extends PaginationParams {
    artist: string;
    [key: string]: unknown;
  }

  interface ChartParams extends PaginationParams {
    [key: string]: unknown;
  }

  interface GeoGetTopArtistsParams extends PaginationParams {
    country: string;
    [key: string]: unknown;
  }

  interface GeoGetTopTracksParams extends PaginationParams {
    country: string;
    location?: string;
    [key: string]: unknown;
  }

  interface LibraryGetArtistsParams extends PaginationParams {
    user: string;
    [key: string]: unknown;
  }

  interface TagGetTopAlbumsParams extends PaginationParams {
    tag: string;
    [key: string]: unknown;
  }

  interface TagGetTopArtistsParams extends PaginationParams {
    tag: string;
    [key: string]: unknown;
  }

  interface TagGetTopTracksParams extends PaginationParams {
    tag: string;
    [key: string]: unknown;
  }

  type TrackGetInfoParams = TrackReferenceParams & {
    username?: string;
    autocorrect?: LastfmBoolean;
    [key: string]: unknown;
  };

  type TrackGetSimilarParams = TrackReferenceParams &
    PaginationParams & {
      autocorrect?: LastfmBoolean;
      [key: string]: unknown;
    };

  type TrackGetTagsParams = TrackReferenceParams & {
    user?: string;
    autocorrect?: LastfmBoolean;
    [key: string]: unknown;
  };

  type TrackGetTopTagsParams = TrackReferenceParams & {
    autocorrect?: LastfmBoolean;
    [key: string]: unknown;
  };

  interface TrackLoveParams {
    artist: string;
    track: string;
  }

  interface TrackScrobbleParams {
    artist: string;
    track: string;
    timestamp: number | string;
    album?: string;
    albumArtist?: string;
    trackNumber?: number | string;
    duration?: number | string;
    mbid?: string;
    context?: string;
    streamId?: string;
    chosenByUser?: LastfmBoolean;
  }

  interface TrackSearchParams extends PaginationParams {
    track: string;
    artist?: string;
    [key: string]: unknown;
  }

  interface TrackUpdateNowPlayingParams {
    artist: string;
    track: string;
    album?: string;
    albumArtist?: string;
    trackNumber?: number | string;
    duration?: number | string;
    mbid?: string;
    context?: string;
  }

  interface UserGetArtistTracksParams extends PaginationParams {
    user: string;
    artist: string;
    startTimestamp?: number | string;
    endTimestamp?: number | string;
    [key: string]: unknown;
  }

  interface UserGetFriendsParams extends PaginationParams {
    user: string;
    recenttracks?: LastfmBoolean;
    [key: string]: unknown;
  }

  interface UserGetLovedTracksParams extends PaginationParams {
    user: string;
    [key: string]: unknown;
  }

  interface UserGetPersonalTagsParams extends PaginationParams {
    user: string;
    tag: string;
    taggingtype: "artist" | "album" | "track";
    [key: string]: unknown;
  }

  interface UserGetRecentTracksParams extends PaginationParams, TimeRangeParams {
    user: string;
    extended?: LastfmBoolean;
    [key: string]: unknown;
  }

  interface UserGetTopAlbumsParams extends PaginationParams, PeriodParams {
    user: string;
    [key: string]: unknown;
  }

  interface UserGetTopArtistsParams extends PaginationParams, PeriodParams {
    user: string;
    [key: string]: unknown;
  }

  interface UserGetTopTracksParams extends PaginationParams, PeriodParams {
    user: string;
    [key: string]: unknown;
  }

  interface UserGetWeeklyChartParams extends TimeRangeParams {
    user: string;
    [key: string]: unknown;
  }

  interface SessionResponse {
    name: string;
    key: string;
    subscriber?: number | string;
    [key: string]: unknown;
  }

  interface AlbumApi {
    addTags(artist: string, album: string, tags: string | string[], callback: LastfmCallback<LastfmWriteResponse>): void;
    getInfo<T = LastfmAlbumInfo>(params: AlbumGetInfoParams, callback: LastfmCallback<T>): void;
    getTags<T = LastfmTagsResponse>(params: AlbumGetTagsParams, callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(params: AlbumGetTopTagsParams, callback: LastfmCallback<T>): void;
    removeTag(artist: string, album: string, tag: string, callback: LastfmCallback<LastfmWriteResponse>): void;
    search<T = LastfmAlbumSearchResults>(params: AlbumSearchParams, callback: LastfmCallback<T>): void;
  }

  interface ArtistApi {
    addTags(artist: string, tags: string | string[], callback: LastfmCallback<LastfmWriteResponse>): void;
    getCorrection<T = LastfmArtistCorrectionsResponse>(artist: string, callback: LastfmCallback<T>): void;
    getInfo<T = LastfmArtistInfo>(params: ArtistGetInfoParams, callback: LastfmCallback<T>): void;
    getSimilar<T = LastfmSimilarArtistsResponse>(params: ArtistGetSimilarParams, callback: LastfmCallback<T>): void;
    getTags<T = LastfmTagsResponse>(params: ArtistGetTagsParams, callback: LastfmCallback<T>): void;
    getTopAlbums<T = LastfmAlbumsPageResponse>(params: ArtistTopListParams, callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(params: ArtistReferenceParams & { autocorrect?: LastfmBoolean; [key: string]: unknown }, callback: LastfmCallback<T>): void;
    getTopTracks<T = LastfmTracksPageResponse>(params: ArtistTopListParams, callback: LastfmCallback<T>): void;
    removeTag(artist: string, tag: string, callback: LastfmCallback<LastfmWriteResponse>): void;
    search<T = LastfmArtistSearchResults>(params: ArtistSearchParams, callback: LastfmCallback<T>): void;
  }

  interface AuthApi {
    getMobileSession(username: string, password: string, callback: LastfmCallback<SessionResponse>): void;
    getSession(token: string, callback: LastfmCallback<SessionResponse>): void;
    getToken(callback: LastfmCallback<string>): void;
  }

  interface ChartApi {
    getLovedTracks<T = LastfmTracksPageResponse>(callback: LastfmCallback<T>): void;
    getLovedTracks<T = LastfmTracksPageResponse>(params: ChartParams, callback: LastfmCallback<T>): void;
    getTopArtists<T = LastfmArtistsPageResponse>(callback: LastfmCallback<T>): void;
    getTopArtists<T = LastfmArtistsPageResponse>(params: ChartParams, callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(params: ChartParams, callback: LastfmCallback<T>): void;
    getTopTracks<T = LastfmTracksPageResponse>(callback: LastfmCallback<T>): void;
    getTopTracks<T = LastfmTracksPageResponse>(params: ChartParams, callback: LastfmCallback<T>): void;
  }

  interface GeoApi {
    getTopArtists<T = LastfmArtistsPageResponse>(params: GeoGetTopArtistsParams, callback: LastfmCallback<T>): void;
    getTopTracks<T = LastfmTracksPageResponse>(params: GeoGetTopTracksParams, callback: LastfmCallback<T>): void;
  }

  interface LibraryApi {
    getArtists<T = LastfmArtistsPageResponse>(params: LibraryGetArtistsParams, callback: LastfmCallback<T>): void;
  }

  interface TagApi {
    getInfo<T = LastfmTag>(tag: string, callback: LastfmCallback<T>): void;
    getInfo<T = LastfmTag>(tag: string, lang: string, callback: LastfmCallback<T>): void;
    getSimilar<T = LastfmSimilarTagsResponse>(tag: string, callback: LastfmCallback<T>): void;
    getTopAlbums<T = LastfmAlbumsPageResponse>(params: TagGetTopAlbumsParams, callback: LastfmCallback<T>): void;
    getTopArtists<T = LastfmArtistsPageResponse>(params: TagGetTopArtistsParams, callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(callback: LastfmCallback<T>): void;
    getTopTracks<T = LastfmTracksPageResponse>(params: TagGetTopTracksParams, callback: LastfmCallback<T>): void;
    getWeeklyChartList<T = LastfmWeeklyChartListResponse>(tag: string, callback: LastfmCallback<T>): void;
  }

  interface TrackApi {
    addTags(artist: string, track: string, tags: string | string[], callback: LastfmCallback<LastfmWriteResponse>): void;
    getCorrection<T = LastfmTrackCorrectionsResponse>(artist: string, track: string, callback: LastfmCallback<T>): void;
    getInfo<T = LastfmTrackInfo>(params: TrackGetInfoParams, callback: LastfmCallback<T>): void;
    getSimilar<T = LastfmSimilarTracksResponse>(params: TrackGetSimilarParams, callback: LastfmCallback<T>): void;
    getTags<T = LastfmTagsResponse>(params: TrackGetTagsParams, callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(params: TrackGetTopTagsParams, callback: LastfmCallback<T>): void;
    love(params: TrackLoveParams, callback: LastfmCallback<LastfmWriteResponse>): void;
    removeTag(artist: string, track: string, tag: string, callback: LastfmCallback<LastfmWriteResponse>): void;
    scrobble<T = LastfmScrobblesResponse>(params: TrackScrobbleParams, callback: LastfmCallback<T>): void;
    scrobble<T = LastfmScrobblesResponse>(params: TrackScrobbleParams[], callback: LastfmCallback<T>): void;
    search<T = LastfmTrackSearchResults>(params: TrackSearchParams, callback: LastfmCallback<T>): void;
    unlove(artist: string, track: string, callback: LastfmCallback<LastfmWriteResponse>): void;
    updateNowPlaying<T = LastfmNowPlayingResponse>(params: TrackUpdateNowPlayingParams, callback: LastfmCallback<T>): void;
  }

  interface UserApi {
    getArtistTracks<T = LastfmArtistTracksResponse>(params: UserGetArtistTracksParams, callback: LastfmCallback<T>): void;
    getFriends<T = LastfmFriendsResponse>(params: UserGetFriendsParams, callback: LastfmCallback<T>): void;
    getInfo<T = LastfmUserProfile>(callback: LastfmCallback<T>): void;
    getInfo<T = LastfmUserProfile>(user: string, callback: LastfmCallback<T>): void;
    getInfo<T = LastfmUserProfile>(user: null, callback: LastfmCallback<T>): void;
    getLovedTracks<T = LastfmTracksPageResponse>(params: UserGetLovedTracksParams, callback: LastfmCallback<T>): void;
    getPersonalTags<T = LastfmTaggingsResponse>(params: UserGetPersonalTagsParams, callback: LastfmCallback<T>): void;
    getRecentTracks<T = LastfmRecentTracksResponse>(params: UserGetRecentTracksParams, callback: LastfmCallback<T>): void;
    getTopAlbums<T = LastfmAlbumsPageResponse>(params: UserGetTopAlbumsParams, callback: LastfmCallback<T>): void;
    getTopArtists<T = LastfmArtistsPageResponse>(params: UserGetTopArtistsParams, callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(user: string, callback: LastfmCallback<T>): void;
    getTopTags<T = LastfmTopTagsResponse>(user: string, limit: number, callback: LastfmCallback<T>): void;
    getTopTracks<T = LastfmTracksPageResponse>(params: UserGetTopTracksParams, callback: LastfmCallback<T>): void;
    getWeeklyAlbumChart<T = LastfmWeeklyAlbumChartResponse>(params: UserGetWeeklyChartParams, callback: LastfmCallback<T>): void;
    getWeeklyArtistChart<T = LastfmWeeklyArtistChartResponse>(params: UserGetWeeklyChartParams, callback: LastfmCallback<T>): void;
    getWeeklyChartList<T = LastfmWeeklyChartListResponse>(user: string, callback: LastfmCallback<T>): void;
    getWeeklyTrackChart<T = LastfmWeeklyTrackChartResponse>(params: UserGetWeeklyChartParams, callback: LastfmCallback<T>): void;
  }

  interface AuthenticationUrlParams {
    cb?: string;
    token?: string;
    [key: string]: unknown;
  }

  class LastfmAPI {
    constructor(options: LastfmApiOptions);

    api: LastfmNodeLike;
    sessionCredentials: LastfmSessionCredentials | null;

    album: AlbumApi;
    artist: ArtistApi;
    auth: AuthApi;
    chart: ChartApi;
    geo: GeoApi;
    library: LibraryApi;
    tag: TagApi;
    track: TrackApi;
    user: UserApi;

    getAuthenticationUrl(params?: AuthenticationUrlParams): string;
    setSessionCredentials(username: string, key: string): void;
    authenticate(token: string, callback: LastfmCallback<LastfmSessionCredentials>): void;
  }

  namespace LastfmAPI {
    export type ScrobbleResponse = LastfmScrobblesResponse;
    export type UserProfile = LastfmUserProfile;
    export type ScrobbleTrackParams = TrackScrobbleParams;
  }

  export = LastfmAPI;
}
