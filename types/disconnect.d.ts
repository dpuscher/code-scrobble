declare module "disconnect" {
  type DiscogsId = number | string;
  type DiscogsOutputFormat = "discogs" | "plaintext" | "html" | string;
  type DiscogsSortDirection = "asc" | "desc" | string;
  type DiscogsRating = 0 | 1 | 2 | 3 | 4 | 5 | number;
  type DiscogsSearchType = "release" | "master" | "artist" | "label" | string;
  type DiscogsCurrencyCode =
    | "USD"
    | "GBP"
    | "EUR"
    | "CAD"
    | "AUD"
    | "JPY"
    | "CHF"
    | "MXN"
    | "BRL"
    | "NZD"
    | "SEK"
    | "ZAR"
    | string;
  type DiscogsMarketplaceListingStatus = "For Sale" | "Draft" | "Expired" | string;
  type DiscogsMarketplaceMediaCondition =
    | "Mint (M)"
    | "Near Mint (NM or M-)"
    | "Very Good Plus (VG+)"
    | "Very Good (VG)"
    | "Good Plus (G+)"
    | "Good (G)"
    | "Fair (F)"
    | "Poor (P)"
    | string;
  type DiscogsMarketplaceSleeveCondition =
    | DiscogsMarketplaceMediaCondition
    | "Generic"
    | "Not Graded"
    | "No Cover"
    | string;
  type DiscogsMarketplaceOrderStatus =
    | "New Order"
    | "Buyer Contacted"
    | "Invoice Sent"
    | "Payment Pending"
    | "Payment Received"
    | "In Progress"
    | "Shipped"
    | "Merged"
    | "Order Changed"
    | "Refund Sent"
    | "Cancelled (Non-Paying Buyer)"
    | "Cancelled (Item Unavailable)"
    | "Cancelled (Per Buyer's Request)"
    | string;
  type DiscogsMarketplaceOrderStatusFilter = DiscogsMarketplaceOrderStatus | "All" | string;

  interface DiscogsRateLimit {
    limit: number;
    used: number;
    remaining: number;
    [key: string]: unknown;
  }

  interface DiscogsError extends Error {
    statusCode: number;
  }

  interface DiscogsCallback<T = unknown> {
    (error: DiscogsError | Error | null, data?: T, rateLimit?: DiscogsRateLimit): void;
  }

  interface DiscogsQueueCallback {
    (error: DiscogsError | Error | null, freeCallsRemaining: number, freeStackPositionsRemaining: number): void;
  }

  interface DiscogsQueueConfig {
    maxStack?: number;
    maxCalls?: number;
    interval?: number;
    [key: string]: unknown;
  }

  interface DiscogsQueue {
    config: DiscogsQueueConfig;
    setConfig(customConfig: DiscogsQueueConfig): this;
    add(callback: DiscogsQueueCallback): this;
    clear(): this;
  }

  interface DiscogsQueueConstructor {
    new (customConfig?: DiscogsQueueConfig): DiscogsQueue;
    (customConfig?: DiscogsQueueConfig): DiscogsQueue;
  }

  interface DiscogsUtil {
    stripVariation(name: string): string;
    addParams(url: string, data?: Record<string, unknown> | null): string;
    escape(value: string | number): string;
    merge<T extends object, U extends object>(target: T, source: U): T & U;
    Queue: DiscogsQueueConstructor;
  }

  interface DiscogsAuth {
    method?: "discogs" | "oauth" | string;
    level?: number;
    userToken?: string;
    consumerKey?: string;
    consumerSecret?: string;
    token?: string;
    tokenSecret?: string;
    authorizeUrl?: string;
    [key: string]: unknown;
  }

  interface DiscogsClientConfig {
    host: string;
    port: number;
    userAgent: string;
    apiVersion: string;
    outputFormat: DiscogsOutputFormat;
    requestLimit: number;
    requestLimitAuth: number;
    requestLimitInterval: number;
    [key: string]: unknown;
  }

  interface DiscogsClientInfo {
    version: string;
    userAgent: string;
    authMethod: string;
    authLevel: number;
  }

  interface DiscogsRequestOptions {
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | string;
    data?: unknown;
    authLevel?: number;
    queue?: boolean;
    json?: boolean;
    encoding?: BufferEncoding | "binary" | string;
    [key: string]: unknown;
  }

  interface DiscogsPaginationParams {
    page?: number;
    per_page?: number;
    sort?: string;
    sort_order?: DiscogsSortDirection;
    [key: string]: unknown;
  }

  interface DiscogsSearchParams extends DiscogsPaginationParams {
    q?: string;
    type?: DiscogsSearchType;
    title?: string;
    release_title?: string;
    credit?: string;
    artist?: string;
    anv?: string;
    label?: string;
    genre?: string;
    style?: string;
    country?: string;
    year?: number | string;
    format?: string;
    catno?: string;
    barcode?: string;
    track?: string;
    submitter?: string;
    contributor?: string;
    [key: string]: unknown;
  }

  interface DiscogsMasterVersionsParams extends DiscogsPaginationParams {
    format?: string;
    label?: string;
    released?: number | string;
    country?: string;
    sort?: "released" | "title" | "format" | "label" | "catno" | "country" | string;
    sort_order?: DiscogsSortDirection;
  }

  interface DiscogsMarketplaceInventoryParams extends DiscogsPaginationParams {
    status?: DiscogsMarketplaceListingStatus;
    sort?: "listed" | "price" | "item" | "artist" | "label" | "catno" | "audio" | "status" | "location" | string;
    sort_order?: DiscogsSortDirection;
  }

  interface DiscogsMarketplaceOrdersParams extends DiscogsPaginationParams {
    status?: DiscogsMarketplaceOrderStatusFilter;
    created_after?: string;
    created_before?: string;
    archived?: boolean;
    sort?: "id" | "buyer" | "created" | "status" | "last_activity" | string;
    sort_order?: DiscogsSortDirection;
  }

  interface DiscogsCollectionReleasesParams extends DiscogsPaginationParams {
    sort?: "label" | "artist" | "title" | "catno" | "format" | "rating" | "added" | "year" | string;
    sort_order?: DiscogsSortDirection;
  }

  interface DiscogsWantlistReleasesParams extends DiscogsPaginationParams {
    sort?: "added" | "artist" | "title" | "label" | "catno" | "format" | "rating" | string;
    sort_order?: DiscogsSortDirection;
  }

  interface DiscogsPaginationUrls {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
    [key: string]: unknown;
  }

  interface DiscogsPagination {
    page: number;
    pages: number;
    per_page: number;
    items: number;
    urls?: DiscogsPaginationUrls;
    [key: string]: unknown;
  }

  interface DiscogsPaginatedResponse {
    pagination: DiscogsPagination;
    [key: string]: unknown;
  }

  interface DiscogsArtistReference {
    id?: number;
    name: string;
    anv?: string;
    join?: string;
    role?: string;
    tracks?: string;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsLabelReference {
    id?: number;
    name: string;
    catno?: string;
    entity_type?: string;
    entity_type_name?: string;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsCommunitySummary {
    have?: number;
    want?: number;
    [key: string]: unknown;
  }

  interface DiscogsImage {
    uri?: string;
    uri150?: string;
    resource_url?: string;
    width?: number;
    height?: number;
    type?: string;
    [key: string]: unknown;
  }

  interface DiscogsTrack {
    position: string;
    type_?: string;
    title: string;
    duration?: string;
    artists?: DiscogsArtistReference[];
    [key: string]: unknown;
  }

  interface DiscogsIdentifier {
    type: string;
    value: string;
    description?: string;
    [key: string]: unknown;
  }

  interface DiscogsSearchResult {
    id: number;
    type?: string;
    title?: string;
    thumb?: string;
    cover_image?: string;
    country?: string;
    year?: number | string;
    format?: string | string[];
    uri?: string;
    barcode?: string[];
    catno?: string;
    genre?: string[];
    style?: string[];
    label?: string[];
    community?: DiscogsCommunitySummary;
    [key: string]: unknown;
  }

  interface DiscogsSearchResponse extends DiscogsPaginatedResponse {
    results: DiscogsSearchResult[];
  }

  interface DiscogsArtistProfile {
    id: number;
    name: string;
    realname?: string;
    profile?: string;
    urls?: string[];
    images?: DiscogsImage[];
    releases_url?: string;
    uri?: string;
    resource_url?: string;
    aliases?: DiscogsArtistReference[];
    members?: DiscogsArtistReference[];
    namevariations?: string[];
    [key: string]: unknown;
  }

  interface DiscogsArtistReleaseSummary {
    id?: number;
    title?: string;
    type?: string;
    main_release?: DiscogsId;
    role?: string;
    year?: number | string;
    thumb?: string;
    artist?: string;
    resource_url?: string;
    stats?: DiscogsCommunitySummary;
    [key: string]: unknown;
  }

  interface DiscogsArtistReleasesResponse extends DiscogsPaginatedResponse {
    releases: DiscogsArtistReleaseSummary[];
  }

  interface DiscogsLabelProfile {
    id: number;
    name: string;
    profile?: string;
    contact_info?: string;
    uri?: string;
    resource_url?: string;
    sublabels?: DiscogsLabelReference[];
    images?: DiscogsImage[];
    [key: string]: unknown;
  }

  interface DiscogsLabelReleaseSummary {
    id?: number;
    title?: string;
    artist?: string;
    catno?: string;
    format?: string;
    thumb?: string;
    year?: number | string;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsLabelReleasesResponse extends DiscogsPaginatedResponse {
    releases: DiscogsLabelReleaseSummary[];
  }

  interface DiscogsRelease {
    id: number;
    title: string;
    artists?: DiscogsArtistReference[];
    labels?: DiscogsLabelReference[];
    year?: number | string;
    uri?: string;
    resource_url?: string;
    tracklist?: DiscogsTrack[];
    images?: DiscogsImage[];
    identifiers?: DiscogsIdentifier[];
    community?: DiscogsCommunitySummary;
    [key: string]: unknown;
  }

  interface DiscogsMasterRelease extends DiscogsRelease {
    main_release?: DiscogsId;
    versions_url?: string;
  }

  interface DiscogsMasterVersion {
    id?: number;
    title?: string;
    country?: string;
    released?: string;
    format?: string;
    label?: string;
    catno?: string;
    major_formats?: string[];
    thumb?: string;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsMasterVersionsResponse extends DiscogsPaginatedResponse {
    versions: DiscogsMasterVersion[];
  }

  interface DiscogsReleaseRating {
    username?: string;
    release_id?: DiscogsId;
    rating?: number;
    [key: string]: unknown;
  }

  interface DiscogsDatabaseStatus {
    accepted: "Accepted";
    draft: "Draft";
    deleted: "Deleted";
    rejected: "Rejected";
  }

  interface DiscogsCollectionReleaseEditData {
    rating?: DiscogsRating;
    folder_id?: DiscogsId;
    [key: string]: unknown;
  }

  interface DiscogsWantlistReleaseData {
    notes?: string;
    rating?: DiscogsRating;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceListingData {
    release_id?: DiscogsId;
    condition?: DiscogsMarketplaceMediaCondition;
    sleeve_condition?: DiscogsMarketplaceSleeveCondition;
    price?: number | string;
    status?: DiscogsMarketplaceListingStatus;
    comments?: string;
    allow_offers?: boolean;
    external_id?: string;
    location?: string;
    weight?: number;
    format_quantity?: number;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceOrderData {
    status?: DiscogsMarketplaceOrderStatus;
    shipping?: number | string;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceOrderMessageData {
    message: string;
    status?: DiscogsMarketplaceOrderStatus;
    email_buyer?: boolean;
    [key: string]: unknown;
  }

  interface DiscogsUserReference {
    id?: number;
    username?: string;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsUserProfile extends DiscogsUserReference {
    username: string;
    name?: string;
    profile?: string;
    home_page?: string;
    location?: string;
    registered?: string;
    rank?: number;
    num_pending?: number;
    num_for_sale?: number;
    num_lists?: number;
    num_collection?: number;
    num_wantlist?: number;
    num_unread_notifications?: number;
    releases_contributed?: number;
    releases_rated?: number;
    rating_avg?: number;
    collection_folders_url?: string;
    collection_fields_url?: string;
    wantlist_url?: string;
    buyer_rating?: number;
    buyer_rating_stars?: number;
    buyer_num_ratings?: number;
    seller_rating?: number;
    seller_rating_stars?: number;
    seller_num_ratings?: number;
    curr_abbr?: DiscogsCurrencyCode;
  }

  interface DiscogsUserIdentity extends DiscogsUserProfile {}

  interface DiscogsMarketplacePrice {
    currency: DiscogsCurrencyCode;
    value: number | string;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceUserSummary extends DiscogsUserReference {
    stats?: {
      rating?: number;
      stars?: number;
      total?: number;
      [key: string]: unknown;
    };
  }

  interface DiscogsMarketplaceReleaseSummary {
    id?: DiscogsId;
    description?: string;
    resource_url?: string;
    thumbnail?: string;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceListing {
    id: number;
    uri?: string;
    status?: DiscogsMarketplaceListingStatus;
    condition?: DiscogsMarketplaceMediaCondition;
    sleeve_condition?: DiscogsMarketplaceSleeveCondition;
    allow_offers?: boolean;
    comments?: string;
    audio?: boolean;
    location?: string;
    weight?: number;
    format_quantity?: number;
    external_id?: string;
    listed?: string;
    resource_url?: string;
    price?: DiscogsMarketplacePrice;
    original_price?: DiscogsMarketplacePrice;
    shipping_price?: DiscogsMarketplacePrice;
    seller?: DiscogsMarketplaceUserSummary;
    release?: DiscogsMarketplaceReleaseSummary;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceInventoryResponse extends DiscogsPaginatedResponse {
    listings: DiscogsMarketplaceListing[];
  }

  interface DiscogsMarketplaceOrderItem {
    id?: DiscogsId;
    release?: DiscogsMarketplaceReleaseSummary;
    condition?: DiscogsMarketplaceMediaCondition;
    sleeve_condition?: DiscogsMarketplaceSleeveCondition;
    price?: DiscogsMarketplacePrice;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceOrder {
    id: string;
    uri?: string;
    resource_url?: string;
    messages_url?: string;
    status?: DiscogsMarketplaceOrderStatus;
    next_status?: DiscogsMarketplaceOrderStatus[];
    fee?: DiscogsMarketplacePrice;
    shipping?: DiscogsMarketplacePrice;
    shipping_address?: string;
    additional_instructions?: string;
    archived?: boolean;
    seller?: DiscogsMarketplaceUserSummary;
    buyer?: DiscogsMarketplaceUserSummary;
    created?: string;
    last_activity?: string;
    items?: DiscogsMarketplaceOrderItem[];
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceOrdersResponse extends DiscogsPaginatedResponse {
    orders: DiscogsMarketplaceOrder[];
  }

  interface DiscogsMarketplaceOrderMessage {
    subject?: string;
    message?: string;
    type?: "message" | "status" | "refund_sent" | "refund_received" | string;
    order?: {
      id?: string;
      resource_url?: string;
      [key: string]: unknown;
    };
    timestamp?: string;
    [key: string]: unknown;
  }

  interface DiscogsMarketplaceOrderMessagesResponse extends DiscogsPaginatedResponse {
    messages: DiscogsMarketplaceOrderMessage[];
  }

  interface DiscogsMarketplaceFeeResponse extends DiscogsMarketplacePrice {}

  interface DiscogsMarketplacePriceSuggestionsResponse {
    "Mint (M)"?: DiscogsMarketplacePrice;
    "Near Mint (NM or M-)"?: DiscogsMarketplacePrice;
    "Very Good Plus (VG+)"?: DiscogsMarketplacePrice;
    "Very Good (VG)"?: DiscogsMarketplacePrice;
    "Good Plus (G+)"?: DiscogsMarketplacePrice;
    "Good (G)"?: DiscogsMarketplacePrice;
    "Fair (F)"?: DiscogsMarketplacePrice;
    "Poor (P)"?: DiscogsMarketplacePrice;
    [condition: string]: DiscogsMarketplacePrice | undefined;
  }

  interface DiscogsCollectionFolder {
    id: number;
    name: string;
    count?: number;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsCollectionFoldersResponse {
    folders: DiscogsCollectionFolder[];
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsCollectionFormat {
    name?: string;
    qty?: string;
    text?: string;
    descriptions?: string[];
    [key: string]: unknown;
  }

  interface DiscogsCollectionBasicInformation {
    id: number;
    title?: string;
    year?: number | string;
    resource_url?: string;
    thumb?: string;
    cover_image?: string;
    master_id?: DiscogsId;
    master_url?: string;
    artists?: DiscogsArtistReference[];
    labels?: DiscogsLabelReference[];
    formats?: DiscogsCollectionFormat[];
    [key: string]: unknown;
  }

  interface DiscogsCollectionReleaseEntry {
    id?: DiscogsId;
    instance_id?: DiscogsId;
    folder_id?: DiscogsId;
    rating?: DiscogsRating;
    notes?: unknown[];
    date_added?: string;
    basic_information?: DiscogsCollectionBasicInformation;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsCollectionReleasesResponse extends DiscogsPaginatedResponse {
    releases: DiscogsCollectionReleaseEntry[];
  }

  interface DiscogsCollectionAddReleaseResponse {
    instance_id: number;
    resource_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsWantlistItem {
    id?: DiscogsId;
    rating?: DiscogsRating;
    notes?: string;
    resource_url?: string;
    basic_information?: DiscogsCollectionBasicInformation;
    [key: string]: unknown;
  }

  interface DiscogsWantlistReleasesResponse extends DiscogsPaginatedResponse {
    wants: DiscogsWantlistItem[];
  }

  interface DiscogsUserContribution {
    id?: DiscogsId;
    title?: string;
    type?: DiscogsSearchType;
    status?: string;
    resource_url?: string;
    uri?: string;
    [key: string]: unknown;
  }

  interface DiscogsUserContributionsResponse extends DiscogsPaginatedResponse {
    contributions: DiscogsUserContribution[];
  }

  interface DiscogsUserSubmissionSummary {
    id?: DiscogsId;
    title?: string;
    type?: DiscogsSearchType;
    status?: string;
    resource_url?: string;
    uri?: string;
    [key: string]: unknown;
  }

  interface DiscogsUserSubmissions {
    artists?: DiscogsUserSubmissionSummary[];
    labels?: DiscogsUserSubmissionSummary[];
    releases?: DiscogsUserSubmissionSummary[];
    masters?: DiscogsUserSubmissionSummary[];
    [key: string]: DiscogsUserSubmissionSummary[] | unknown;
  }

  interface DiscogsUserSubmissionsResponse extends DiscogsPaginatedResponse {
    submissions: DiscogsUserSubmissions;
  }

  interface DiscogsUserListSummary {
    id?: DiscogsId;
    list_id?: DiscogsId;
    name?: string;
    description?: string;
    public?: boolean;
    uri?: string;
    resource_url?: string;
    date_changed?: string;
    date_added?: string;
    items?: number;
    [key: string]: unknown;
  }

  interface DiscogsUserListsResponse extends DiscogsPaginatedResponse {
    lists: DiscogsUserListSummary[];
  }

  interface DiscogsListItem {
    id?: DiscogsId;
    comment?: string;
    display_title?: string;
    type?: string;
    uri?: string;
    resource_url?: string;
    image_url?: string;
    [key: string]: unknown;
  }

  interface DiscogsListItemsResponse extends DiscogsPaginatedResponse {
    id?: DiscogsId;
    list_id?: DiscogsId;
    name?: string;
    description?: string;
    public?: boolean;
    uri?: string;
    resource_url?: string;
    date_changed?: string;
    date_added?: string;
    items: DiscogsListItem[];
    [key: string]: unknown;
  }

  interface DiscogsOAuthConfig {
    requestTokenUrl?: string;
    accessTokenUrl?: string;
    authorizeUrl?: string;
    version?: string;
    signatureMethod?: "PLAINTEXT" | "HMAC-SHA1" | string;
    [key: string]: unknown;
  }

  type DiscogsRequestResult<T = unknown> = DiscogsClient | Promise<T>;

  interface DiscogsDatabase {
    status: DiscogsDatabaseStatus;

    getArtist(artist: DiscogsId, callback?: DiscogsCallback<DiscogsArtistProfile>): DiscogsRequestResult<DiscogsArtistProfile>;
    getArtistReleases(
      artist: DiscogsId,
      params?: DiscogsPaginationParams | DiscogsCallback<DiscogsArtistReleasesResponse>,
      callback?: DiscogsCallback<DiscogsArtistReleasesResponse>,
    ): DiscogsRequestResult<DiscogsArtistReleasesResponse>;
    getRelease(release: DiscogsId, callback?: DiscogsCallback<DiscogsRelease>): DiscogsRequestResult<DiscogsRelease>;
    getReleaseRating(
      release: DiscogsId,
      user: string,
      callback?: DiscogsCallback<DiscogsReleaseRating>,
    ): DiscogsRequestResult<DiscogsReleaseRating>;
    setReleaseRating(
      release: DiscogsId,
      user: string,
      rating: number | null | undefined,
      callback?: DiscogsCallback<DiscogsReleaseRating>,
    ): DiscogsRequestResult<DiscogsReleaseRating>;
    getMaster(master: DiscogsId, callback?: DiscogsCallback<DiscogsMasterRelease>): DiscogsRequestResult<DiscogsMasterRelease>;
    getMasterVersions(
      master: DiscogsId,
      params?: DiscogsMasterVersionsParams | DiscogsCallback<DiscogsMasterVersionsResponse>,
      callback?: DiscogsCallback<DiscogsMasterVersionsResponse>,
    ): DiscogsRequestResult<DiscogsMasterVersionsResponse>;
    getLabel(label: DiscogsId, callback?: DiscogsCallback<DiscogsLabelProfile>): DiscogsRequestResult<DiscogsLabelProfile>;
    getLabelReleases(
      label: DiscogsId,
      params?: DiscogsPaginationParams | DiscogsCallback<DiscogsLabelReleasesResponse>,
      callback?: DiscogsCallback<DiscogsLabelReleasesResponse>,
    ): DiscogsRequestResult<DiscogsLabelReleasesResponse>;
    getImage(url: string, callback?: DiscogsCallback<string>): DiscogsRequestResult<string>;
    search(
      query?: string | DiscogsSearchParams,
      params?: DiscogsSearchParams | DiscogsCallback<DiscogsSearchResponse>,
      callback?: DiscogsCallback<DiscogsSearchResponse>,
    ): DiscogsRequestResult<DiscogsSearchResponse>;
  }

  interface DiscogsMarketplace {
    getInventory<T = DiscogsMarketplaceInventoryResponse>(
      user: string,
      params?: DiscogsMarketplaceInventoryParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getListing<T = DiscogsMarketplaceListing>(listing: DiscogsId, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    addListing<T = DiscogsMarketplaceListing>(
      data: DiscogsMarketplaceListingData,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    editListing<T = DiscogsMarketplaceListing>(
      listing: DiscogsId,
      data: DiscogsMarketplaceListingData,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    deleteListing<T = Record<string, unknown>>(listing: DiscogsId, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    getOrders<T = DiscogsMarketplaceOrdersResponse>(
      params?: DiscogsMarketplaceOrdersParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getOrder<T = DiscogsMarketplaceOrder>(order: string, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    editOrder<T = DiscogsMarketplaceOrder>(
      order: string,
      data: DiscogsMarketplaceOrderData,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getOrderMessages<T = DiscogsMarketplaceOrderMessagesResponse>(
      order: string,
      params?: DiscogsPaginationParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    addOrderMessage<T = DiscogsMarketplaceOrderMessage>(
      order: string,
      data: DiscogsMarketplaceOrderMessageData,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getFee<T = DiscogsMarketplaceFeeResponse>(
      price: number | string,
      currency?: DiscogsCurrencyCode | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getPriceSuggestions<T = DiscogsMarketplacePriceSuggestionsResponse>(
      release: DiscogsId,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
  }

  interface DiscogsCollection {
    getFolders<T = DiscogsCollectionFoldersResponse>(user: string, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    getFolder<T = DiscogsCollectionFolder>(user: string, folder: DiscogsId, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    addFolder<T = DiscogsCollectionFolder>(user: string, name: string, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    setFolderName<T = DiscogsCollectionFolder>(
      user: string,
      folder: DiscogsId,
      name: string,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    deleteFolder<T = Record<string, unknown>>(user: string, folder: DiscogsId, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    getReleases<T = DiscogsCollectionReleasesResponse>(
      user: string,
      folder: DiscogsId,
      params?: DiscogsCollectionReleasesParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getReleaseInstances<T = DiscogsCollectionReleasesResponse>(
      user: string,
      release: DiscogsId,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    addRelease<T = DiscogsCollectionAddReleaseResponse>(
      user: string,
      folder: DiscogsId,
      release: DiscogsId,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    addRelease<T = DiscogsCollectionAddReleaseResponse>(
      user: string,
      release: DiscogsId,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    editRelease<T = DiscogsCollectionReleaseEntry>(
      user: string,
      folder: DiscogsId,
      release: DiscogsId,
      instance: DiscogsId,
      data: DiscogsCollectionReleaseEditData,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    removeRelease<T = Record<string, unknown>>(
      user: string,
      folder: DiscogsId,
      release: DiscogsId,
      instance: DiscogsId,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
  }

  interface DiscogsWantlist {
    getReleases<T = DiscogsWantlistReleasesResponse>(
      user: string,
      params?: DiscogsWantlistReleasesParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    addRelease<T = DiscogsWantlistItem>(
      user: string,
      release: DiscogsId,
      data?: DiscogsWantlistReleaseData | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    editNotes<T = DiscogsWantlistItem>(
      user: string,
      release: DiscogsId,
      data: DiscogsWantlistReleaseData,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    removeRelease<T = Record<string, unknown>>(user: string, release: DiscogsId, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
  }

  interface DiscogsList {
    getItems<T = DiscogsListItemsResponse>(
      list: DiscogsId,
      params?: DiscogsPaginationParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
  }

  interface DiscogsUser {
    getProfile<T = DiscogsUserProfile>(user: string, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    getInventory<T = DiscogsMarketplaceInventoryResponse>(
      user: string,
      params?: DiscogsMarketplaceInventoryParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getIdentity<T = DiscogsUserIdentity>(callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    collection(): DiscogsCollection;
    wantlist(): DiscogsWantlist;
    list(): DiscogsList;
    getContributions<T = DiscogsUserContributionsResponse>(
      user: string,
      params?: DiscogsPaginationParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getSubmissions<T = DiscogsUserSubmissionsResponse>(
      user: string,
      params?: DiscogsPaginationParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    getLists<T = DiscogsUserListsResponse>(
      user: string,
      params?: DiscogsPaginationParams | DiscogsCallback<T>,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
  }

  interface DiscogsOAuth {
    auth: DiscogsAuth;
    config: DiscogsOAuthConfig;
    setConfig(customConfig: DiscogsOAuthConfig): this;
    getRequestToken(
      consumerKey: string,
      consumerSecret: string,
      callbackUrl: string,
      callback?: (error: DiscogsError | Error | null, requestData?: DiscogsAuth) => void,
    ): this;
    getAccessToken(
      verifier: string,
      callback?: (error: DiscogsError | Error | null, accessData?: DiscogsAuth) => void,
    ): this;
    export(): DiscogsAuth;
    toHeader(requestMethod: string, url: string): string;
  }

  interface DiscogsClient {
    config: DiscogsClientConfig;
    auth?: DiscogsAuth;

    setConfig(customConfig: Partial<DiscogsClientConfig>): this;
    authenticated(level?: number): boolean;

    getIdentity<T = DiscogsUserIdentity>(callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    about<T = unknown>(callback?: DiscogsCallback<T & { disconnect: DiscogsClientInfo }>): DiscogsRequestResult<
      T & { disconnect: DiscogsClientInfo }
    >;

    _rawRequest<T = unknown>(options: DiscogsRequestOptions, callback: DiscogsCallback<T>): this;
    _request<T = unknown>(options: DiscogsRequestOptions, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;

    get<T = unknown>(options: string | DiscogsRequestOptions, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;
    post<T = unknown>(
      options: string | DiscogsRequestOptions,
      data?: unknown,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    put<T = unknown>(
      options: string | DiscogsRequestOptions,
      data?: unknown,
      callback?: DiscogsCallback<T>,
    ): DiscogsRequestResult<T>;
    delete<T = unknown>(options: string | DiscogsRequestOptions, callback?: DiscogsCallback<T>): DiscogsRequestResult<T>;

    oauth(): DiscogsOAuth;
    database(): DiscogsDatabase;
    marketplace(): DiscogsMarketplace;
    user(): DiscogsUser;
  }

  interface DiscogsClientConstructor {
    new (): DiscogsClient;
    new (auth: DiscogsAuth): DiscogsClient;
    new (userAgent: string, auth?: DiscogsAuth): DiscogsClient;
    (): DiscogsClient;
    (auth: DiscogsAuth): DiscogsClient;
    (userAgent: string, auth?: DiscogsAuth): DiscogsClient;
  }

  interface DisconnectModule {
    util: DiscogsUtil;
    Client: DiscogsClientConstructor;
  }

  const disconnect: DisconnectModule;
  export = disconnect;
}
