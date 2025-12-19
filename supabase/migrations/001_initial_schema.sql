-- Initial database schema for AI Stories app
-- This creates all base tables with their full structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  photo_url TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'pro', 'family')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Achievements & Reading Tracking
  reading_streak_current INTEGER DEFAULT 0,
  reading_streak_longest INTEGER DEFAULT 0,
  last_read_date DATE,
  total_points INTEGER DEFAULT 0,
  reader_level TEXT DEFAULT 'bronze' CHECK (reader_level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),

  -- Voice Cloning
  custom_voice_id TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step TEXT DEFAULT 'welcome',
  onboarding_dismissed_at TIMESTAMPTZ,
  onboarding_checklist JSONB DEFAULT '{
    "items": [
      {"id": "first_story", "label": "Create your first story", "completed": false},
      {"id": "create_profile", "label": "Add a child profile", "completed": false},
      {"id": "try_theme", "label": "Explore different themes", "completed": false},
      {"id": "customize_appearance", "label": "Customize character appearance", "completed": false},
      {"id": "visit_discover", "label": "Discover community stories", "completed": false},
      {"id": "read_achievement", "label": "Start a reading streak", "completed": false}
    ],
    "dismissed": false
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  child_name TEXT NOT NULL,
  adjectives TEXT[] NOT NULL DEFAULT '{}',
  theme TEXT NOT NULL,
  moral TEXT,

  -- Image support
  has_images BOOLEAN NOT NULL DEFAULT false,
  image_urls TEXT[] DEFAULT '{}',

  -- Draft support
  parent_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  draft_number INTEGER DEFAULT 1,
  is_selected_draft BOOLEAN DEFAULT false,

  -- Appearance customization
  appearance JSONB,

  -- Multi-child support
  children JSONB DEFAULT NULL,

  -- Illustrated books (ProMax feature)
  is_illustrated_book BOOLEAN DEFAULT false,
  book_pages JSONB DEFAULT '[]'::jsonb,

  -- Discovery/Social features
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  view_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CHILD PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  birth_date DATE,
  appearance JSONB DEFAULT '{}', -- { skinTone, hairColor, hairStyle }
  ai_description TEXT, -- AI-generated description for consistent illustration generation
  ai_generated_image_url TEXT, -- AI-processed version of uploaded image (safe)
  original_image_uploaded_at TIMESTAMPTZ, -- Track when original was uploaded (but not stored)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name) -- One profile per child name per user
);

-- =====================================================
-- USAGE TABLE (for trial tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stories_generated INTEGER NOT NULL DEFAULT 0,
  trial_completed BOOLEAN NOT NULL DEFAULT false,
  trial_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('trial', 'pro', 'family')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DAILY USAGE TABLE (for rolling window limits)
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Story generation counts
  text_stories_count INTEGER DEFAULT 0,
  illustrated_stories_count INTEGER DEFAULT 0,

  -- Timestamps for rolling window enforcement (24-hour)
  first_text_story_at TIMESTAMPTZ,
  first_illustrated_story_at TIMESTAMPTZ,

  -- Tracking
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one row per user per date
  UNIQUE(user_id, usage_date)
);

-- =====================================================
-- FEATURED STORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS featured_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  featured_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Display information
  display_title TEXT,
  display_excerpt TEXT,
  featured_order INTEGER DEFAULT 0,

  -- Categorization
  category TEXT,
  tags TEXT[],

  -- Visibility
  is_active BOOLEAN DEFAULT TRUE,
  featured_from TIMESTAMPTZ DEFAULT NOW(),
  featured_until TIMESTAMPTZ,

  -- Metrics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id)
);

-- =====================================================
-- SHARED STORY TOKENS TABLE (for public sharing)
-- =====================================================
CREATE TABLE IF NOT EXISTS shared_story_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Token for public access
  token TEXT NOT NULL UNIQUE,

  -- Access control
  requires_auth BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,

  -- Tracking
  shared_via TEXT,
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'streak', 'explorer', 'creator', 'special')),
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('story_count', 'streak_days', 'theme_count', 'special')),
  requirement_value INTEGER NOT NULL DEFAULT 1,
  points INTEGER NOT NULL DEFAULT 10,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  is_viewed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- READING SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT TRUE,
  audio_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VOICE PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'cloned',
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  weekly_summary BOOLEAN DEFAULT true,
  bedtime_reminder BOOLEAN DEFAULT false,
  bedtime_reminder_time TIME DEFAULT '19:00:00',
  achievement_notifications BOOLEAN DEFAULT true,
  new_features BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('weekly_summary', 'bedtime_reminder', 'achievement', 'new_feature')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STORY LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- =====================================================
-- STORY COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  parent_comment_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STORY RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS story_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- =====================================================
-- STORY REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS story_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'copyright', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_reading_streak_current ON users(reading_streak_current DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_read_date ON users(last_read_date DESC);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

-- Stories indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_parent_story_id ON stories(parent_story_id);
CREATE INDEX IF NOT EXISTS idx_stories_draft_number ON stories(draft_number);
CREATE INDEX IF NOT EXISTS idx_stories_children ON stories USING GIN (children);
CREATE INDEX IF NOT EXISTS idx_stories_is_illustrated_book ON stories(is_illustrated_book) WHERE is_illustrated_book = true;
CREATE INDEX IF NOT EXISTS idx_stories_visibility ON stories(visibility);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON stories(published_at DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_stories_likes_count ON stories(likes_count DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_stories_average_rating ON stories(average_rating DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_stories_theme_public ON stories(theme) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_stories_trending ON stories(created_at DESC, likes_count DESC) WHERE visibility = 'public';

-- Child profiles indexes
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_name ON child_profiles(name);

-- Usage indexes
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage(user_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

-- Daily usage indexes
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_daily_usage_timestamps ON daily_usage(first_text_story_at, first_illustrated_story_at);

-- Featured stories indexes
CREATE INDEX IF NOT EXISTS idx_featured_stories_active ON featured_stories(is_active, featured_order) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_featured_stories_category ON featured_stories(category, is_active);
CREATE INDEX IF NOT EXISTS idx_featured_stories_dates ON featured_stories(featured_from, featured_until);

-- Shared story tokens indexes
CREATE INDEX IF NOT EXISTS idx_shared_tokens_story ON shared_story_tokens(story_id);
CREATE INDEX IF NOT EXISTS idx_shared_tokens_user ON shared_story_tokens(shared_by);
CREATE INDEX IF NOT EXISTS idx_shared_tokens_expires ON shared_story_tokens(expires_at);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- Reading sessions indexes
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_story_id ON reading_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_read_at ON reading_sessions(read_at DESC);

-- Voice profiles indexes
CREATE INDEX IF NOT EXISTS idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_voice_id ON voice_profiles(voice_id);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_is_active ON voice_profiles(is_active);

-- Email preferences indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- Email queue indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);

-- Story interactions indexes
CREATE INDEX IF NOT EXISTS idx_story_likes_story ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user ON story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_created_at ON story_likes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_comments_story ON story_comments(story_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_comments_user ON story_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_parent ON story_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_story_ratings_story ON story_ratings(story_id);
CREATE INDEX IF NOT EXISTS idx_story_ratings_user ON story_ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_story_reports_story ON story_reports(story_id);
CREATE INDEX IF NOT EXISTS idx_story_reports_user ON story_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_story_reports_status ON story_reports(status, created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_child_profiles_updated_at ON child_profiles;
CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_updated_at ON usage;
CREATE TRIGGER update_usage_updated_at BEFORE UPDATE ON usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_usage_updated_at ON daily_usage;
CREATE TRIGGER update_daily_usage_updated_at BEFORE UPDATE ON daily_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_featured_stories_updated_at ON featured_stories;
CREATE TRIGGER update_featured_stories_updated_at BEFORE UPDATE ON featured_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voice_profiles_updated_at ON voice_profiles;
CREATE TRIGGER update_voice_profiles_updated_at BEFORE UPDATE ON voice_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON email_preferences;
CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON email_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_story_comments_updated_at ON story_comments;
CREATE TRIGGER update_story_comments_updated_at BEFORE UPDATE ON story_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_story_reports_updated_at ON story_reports;
CREATE TRIGGER update_story_reports_updated_at BEFORE UPDATE ON story_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with subscription and achievement tracking';
COMMENT ON TABLE stories IS 'User-generated stories with support for drafts, illustrations, and social features';
COMMENT ON TABLE child_profiles IS 'Child profiles for personalized stories (Family Plan feature)';
COMMENT ON TABLE usage IS 'Trial usage tracking';
COMMENT ON TABLE payments IS 'Payment transaction history';
COMMENT ON TABLE daily_usage IS 'Daily story generation usage with rolling 24-hour windows';
COMMENT ON TABLE featured_stories IS 'Stories curated for display on public homepage';
COMMENT ON TABLE shared_story_tokens IS 'Tokens for sharing stories with authentication requirement';
COMMENT ON TABLE achievements IS 'Defines all possible achievements users can unlock';
COMMENT ON TABLE user_achievements IS 'Tracks which achievements each user has unlocked';
COMMENT ON TABLE reading_sessions IS 'Records every time a user reads a story';
COMMENT ON TABLE voice_profiles IS 'Stores user voice clones from ElevenLabs';
COMMENT ON TABLE email_preferences IS 'User email notification preferences';
COMMENT ON TABLE email_queue IS 'Queue for scheduled email notifications';
COMMENT ON TABLE story_likes IS 'Tracks user likes on public stories';
COMMENT ON TABLE story_comments IS 'User comments on public stories with threading support';
COMMENT ON TABLE story_ratings IS 'User ratings (1-5 stars) for public stories';
COMMENT ON TABLE story_reports IS 'User reports for inappropriate content';

-- Column comments
COMMENT ON COLUMN stories.parent_story_id IS 'If set, this story is a draft of the parent story';
COMMENT ON COLUMN stories.draft_number IS 'The draft number (1, 2, 3, etc.) for this version';
COMMENT ON COLUMN stories.is_selected_draft IS 'True if this draft was selected as the final version';
COMMENT ON COLUMN stories.appearance IS 'Child appearance customization data: {skinTone, hairColor, hairStyle}';
COMMENT ON COLUMN stories.children IS 'JSONB array of child objects for multi-child stories';
COMMENT ON COLUMN stories.is_illustrated_book IS 'Indicates if story is in illustrated book format (ProMax feature)';
COMMENT ON COLUMN stories.book_pages IS 'Structured book pages with illustrations and text';

COMMENT ON COLUMN child_profiles.ai_description IS 'AI-generated description for consistent illustration generation';
COMMENT ON COLUMN child_profiles.ai_generated_image_url IS 'AI-generated safe version of the child image';
COMMENT ON COLUMN child_profiles.original_image_uploaded_at IS 'Timestamp when original image was uploaded';

COMMENT ON COLUMN users.onboarding_completed IS 'Whether user has completed the initial onboarding flow';
COMMENT ON COLUMN users.onboarding_step IS 'Current step in onboarding: welcome, profile_setup, tour_active, first_story, completed';
COMMENT ON COLUMN users.onboarding_dismissed_at IS 'When user dismissed/skipped onboarding';
COMMENT ON COLUMN users.onboarding_checklist IS 'JSON object tracking optional discovery tasks';
