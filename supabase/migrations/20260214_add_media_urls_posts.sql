-- Add media_urls column (JSONB) to posts table
ALTER TABLE "valentine"."posts" ADD COLUMN "media_urls" jsonb DEFAULT '[]'::jsonb;

-- Migrate existing media_url to media_urls
UPDATE "valentine"."posts"
SET "media_urls" = jsonb_build_array("media_url")
WHERE "media_url" IS NOT NULL AND "media_url" != '';

-- If you want to keep data consistent, ensuring empty array for nulls
UPDATE "valentine"."posts"
SET "media_urls" = '[]'::jsonb
WHERE "media_url" IS NULL OR "media_url" = '';
