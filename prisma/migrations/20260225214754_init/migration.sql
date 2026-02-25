-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(24) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "lastfm_url" TEXT,
    "image_small" TEXT,
    "image_large" TEXT,
    "image_xlarge" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" VARCHAR(24) NOT NULL,
    "discogs_id" BIGINT NOT NULL,
    "barcode" TEXT,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT,
    "discogs_url" TEXT,
    "release_year" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_tracks" (
    "id" VARCHAR(24) NOT NULL,
    "release_id" VARCHAR(24) NOT NULL,
    "track_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL,

    CONSTRAINT "release_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrobble_history" (
    "id" VARCHAR(24) NOT NULL,
    "user_id" VARCHAR(24) NOT NULL,
    "release_id" VARCHAR(24) NOT NULL,
    "scrobbled_at" TIMESTAMPTZ NOT NULL,
    "legacy_array_index" INTEGER,

    CONSTRAINT "scrobble_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_instant_scrobbles" (
    "user_id" VARCHAR(24) NOT NULL,
    "release_id" VARCHAR(24) NOT NULL,

    CONSTRAINT "user_instant_scrobbles_pkey" PRIMARY KEY ("user_id","release_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "releases_discogs_id_key" ON "releases"("discogs_id");

-- CreateIndex
CREATE INDEX "releases_barcode_idx" ON "releases"("barcode");

-- CreateIndex
CREATE INDEX "release_tracks_release_id_track_number_idx" ON "release_tracks"("release_id", "track_number");

-- CreateIndex
CREATE INDEX "scrobble_history_user_id_scrobbled_at_id_idx" ON "scrobble_history"("user_id", "scrobbled_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "scrobble_history_release_id_idx" ON "scrobble_history"("release_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_tracks" ADD CONSTRAINT "release_tracks_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrobble_history" ADD CONSTRAINT "scrobble_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrobble_history" ADD CONSTRAINT "scrobble_history_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_instant_scrobbles" ADD CONSTRAINT "user_instant_scrobbles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_instant_scrobbles" ADD CONSTRAINT "user_instant_scrobbles_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
