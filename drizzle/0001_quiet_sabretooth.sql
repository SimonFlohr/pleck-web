CREATE TABLE "family_circles" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_clerk_id" text NOT NULL,
	"name" text NOT NULL,
	"avatar_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
