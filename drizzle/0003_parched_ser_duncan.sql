CREATE TYPE "public"."ai_category" AS ENUM('milestone', 'everyday', 'occasion');--> statement-breakpoint
CREATE TYPE "public"."circle_tier" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TYPE "public"."member_language" AS ENUM('en', 'nl');--> statement-breakpoint
CREATE TYPE "public"."spark_type" AS ENUM('photo', 'voice', 'text');--> statement-breakpoint
CREATE TABLE "sparks" (
	"id" serial PRIMARY KEY NOT NULL,
	"circle_id" integer NOT NULL,
	"author_member_id" integer NOT NULL,
	"author_timezone" text NOT NULL,
	"author_local_date" date NOT NULL,
	"type" "spark_type" NOT NULL,
	"text_content" text,
	"media_key" text,
	"media_mime" text,
	"media_size_bytes" bigint,
	"media_sha256" text,
	"media_original_filename" text,
	"happened_at" timestamp with time zone,
	"ai_category" "ai_category",
	"category_overridden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "health_check" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "health_check" CASCADE;--> statement-breakpoint
ALTER TABLE "members" RENAME COLUMN "clerk_id" TO "clerk_user_id";--> statement-breakpoint
ALTER TABLE "family_circles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "family_circles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "family_circles" ADD COLUMN "owner_member_id" integer;--> statement-breakpoint
ALTER TABLE "family_circles" ADD COLUMN "join_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "family_circles" ADD COLUMN "tier" "circle_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "family_circles" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "family_circles" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "display_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "timezone" text DEFAULT 'America/Chicago' NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "language" "member_language" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sparks" ADD CONSTRAINT "sparks_circle_id_family_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."family_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sparks" ADD CONSTRAINT "sparks_author_member_id_members_id_fk" FOREIGN KEY ("author_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sparks_feed_idx" ON "sparks" USING btree ("circle_id","author_local_date","created_at","id");--> statement-breakpoint
ALTER TABLE "family_circles" DROP COLUMN "owner_clerk_id";--> statement-breakpoint
ALTER TABLE "family_circles" DROP COLUMN "avatar_key";--> statement-breakpoint
ALTER TABLE "family_circles" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "joined_at";