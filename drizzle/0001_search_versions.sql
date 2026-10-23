CREATE TABLE "versions_cache" (
	"master_id" integer NOT NULL,
	"format" text NOT NULL,
	"data" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "versions_cache_master_id_format_pk" PRIMARY KEY("master_id","format")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "search_format" text;