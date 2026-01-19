-- Performance optimization indexes

-- Composite index for theme-filtered discovery feed
CREATE INDEX IF NOT EXISTS idx_stories_theme_published_at ON stories (theme, published_at DESC) WHERE visibility = 'public';

-- Composite index for user's story list (common query: user_id + created_at DESC)
CREATE INDEX IF NOT EXISTS idx_stories_user_id_created_at_desc ON stories (user_id, created_at DESC);

-- Composite index for discovery search (theme + visibility)
CREATE INDEX IF NOT EXISTS idx_stories_visibility_theme ON stories (visibility, theme) WHERE visibility = 'public';

-- Index for searching story content (GIN index for ilike performance)
-- Note: ilike %term% is still slow, but this can help with some search patterns
-- For full text search, we would use to_tsvector, but ilike is currently used in the API
CREATE INDEX IF NOT EXISTS idx_stories_title_trgm ON stories USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stories_content_trgm ON stories USING gin (content gin_trgm_ops);

-- Ensure pg_trgm extension is enabled for the above indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

