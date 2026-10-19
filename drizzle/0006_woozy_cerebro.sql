DROP INDEX "sparks_feed_idx";--> statement-breakpoint
CREATE INDEX "sparks_text_trgm_idx" ON "sparks" USING gin ("text_content" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "sparks_feed_idx" ON "sparks" USING btree ("circle_id","author_local_date","created_at","id") WHERE "sparks"."deleted_at" is null;