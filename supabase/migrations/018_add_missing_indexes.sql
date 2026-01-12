-- Add missing database indexes for frequently queried fields
-- These indexes improve query performance for critical operations

-- Index for users.email (critical for webhook lookups)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite index for story_likes (user_id + story_id)
-- Used when checking if user has liked a story
CREATE INDEX IF NOT EXISTS idx_story_likes_user_story ON story_likes(user_id, story_id);

-- Composite index for story_comments (story_id + created_at)
-- Used when fetching comments for a story, ordered by date
CREATE INDEX IF NOT EXISTS idx_story_comments_story_created ON story_comments(story_id, created_at DESC);

-- Index for story_ratings (story_id + user_id)
-- Used when checking if user has rated a story
CREATE INDEX IF NOT EXISTS idx_story_ratings_story_user ON story_ratings(story_id, user_id);

-- Index for story_reports (status)
-- Used in admin dashboard to filter by status
CREATE INDEX IF NOT EXISTS idx_story_reports_status ON story_reports(status) WHERE status = 'pending';

-- Index for users (lemonsqueezy_customer_id)
-- Critical for webhook processing to find users by customer ID
CREATE INDEX IF NOT EXISTS idx_users_lemonsqueezy_customer_id ON users(lemonsqueezy_customer_id) WHERE lemonsqueezy_customer_id IS NOT NULL;

-- Index for users (lemonsqueezy_subscription_id)
-- Used for subscription management
CREATE INDEX IF NOT EXISTS idx_users_lemonsqueezy_subscription_id ON users(lemonsqueezy_subscription_id) WHERE lemonsqueezy_subscription_id IS NOT NULL;

-- Index for child_profiles (user_id)
-- Used when fetching all profiles for a user
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);

-- Index for reading_sessions (user_id + created_at)
-- Used for reading streak calculations
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_created ON reading_sessions(user_id, created_at DESC);

-- Index for daily_usage (user_id + usage_date)
-- Used for daily limit checks
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, usage_date DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_users_email IS 'Index for email lookups (critical for payment webhooks)';
COMMENT ON INDEX idx_story_likes_user_story IS 'Composite index for checking user likes on stories';
COMMENT ON INDEX idx_story_comments_story_created IS 'Composite index for fetching story comments ordered by date';
COMMENT ON INDEX idx_users_lemonsqueezy_customer_id IS 'Index for finding users by Lemon Squeezy customer ID (critical for webhooks)';
