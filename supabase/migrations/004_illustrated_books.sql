-- Migration: Add illustrated books support
-- Description: Adds support for AI-illustrated story books with child as hero
-- Date: 2025-12-09

-- Add AI description to child_profiles for consistent character generation
ALTER TABLE child_profiles
ADD COLUMN IF NOT EXISTS ai_description TEXT;

COMMENT ON COLUMN child_profiles.ai_description IS 'AI-generated description of child from original photo analysis, used as reference for consistent illustration generation';

-- Add illustrated book support to stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS is_illustrated_book BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS book_pages JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN stories.is_illustrated_book IS 'Indicates if story is in illustrated book format (ProMax feature)';
COMMENT ON COLUMN stories.book_pages IS 'Structured book pages with illustrations and text: [{pageNumber: number, illustration_url: string, text: string}]';

-- Create index for faster queries on illustrated books
CREATE INDEX IF NOT EXISTS idx_stories_is_illustrated_book ON stories(is_illustrated_book) WHERE is_illustrated_book = true;

-- Update updated_at trigger to include new columns
-- (assuming updated_at trigger already exists from previous migrations)
