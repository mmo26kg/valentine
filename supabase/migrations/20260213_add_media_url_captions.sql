-- Add media_url column to captions table
ALTER TABLE valentine.captions ADD COLUMN IF NOT EXISTS media_url TEXT;
