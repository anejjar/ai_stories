-- Combined migrations to update existing Supabase database
-- This applies migrations 002-008 in the correct order
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- Migration 002: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Stories table policies
DROP POLICY IF EXISTS "Users can read own stories" ON stories;
CREATE POLICY "Users can read own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stories" ON stories;
CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Usage table policies
DROP POLICY IF EXISTS "Users can read own usage" ON usage;
CREATE POLICY "Users can read own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON usage;
CREATE POLICY "Users can insert own usage"
  ON usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON usage;
CREATE POLICY "Users can update own usage"
  ON usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Payments table policies
DROP POLICY IF EXISTS "Users can read own payments" ON payments;
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- Migration 003: User Profile Trigger
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    'trial'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Initialize trial usage
  INSERT INTO public.usage (user_id, stories_generated, trial_completed)
  VALUES (NEW.id, 0, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.usage TO anon, authenticated;

-- ============================================================================
-- Migration 004: Add Story Drafts Support
-- ============================================================================

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS parent_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS draft_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_selected_draft BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_stories_parent_story_id ON stories(parent_story_id);
CREATE INDEX IF NOT EXISTS idx_stories_draft_number ON stories(draft_number);

COMMENT ON COLUMN stories.parent_story_id IS 'If set, this story is a draft of the parent story. NULL means it is a standalone story or the parent draft.';
COMMENT ON COLUMN stories.draft_number IS 'The draft number (1, 2, 3, etc.) for this version of the story';
COMMENT ON COLUMN stories.is_selected_draft IS 'True if this draft was selected as the final version by the user';

-- ============================================================================
-- Migration 005: Add Multi-Child Story Support
-- ============================================================================

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS children JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_children ON stories USING GIN (children);

COMMENT ON COLUMN stories.children IS 'JSONB array of child objects: [{"name": "Emma", "adjectives": ["brave", "kind"], "appearance": {...}}, ...]. If NULL, use child_name for backward compatibility.';

-- Migrate existing data: convert single child_name to children array format
-- Only update rows that don't have children data yet
UPDATE stories 
SET children = jsonb_build_array(
  jsonb_build_object(
    'name', child_name,
    'adjectives', to_jsonb(adjectives)
  )
)
WHERE children IS NULL AND child_name IS NOT NULL;

-- ============================================================================
-- Migration 006: Add Appearance Column
-- ============================================================================

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS appearance JSONB;

COMMENT ON COLUMN stories.appearance IS 'Child appearance customization data (PRO MAX only): {skinTone, hairColor, hairStyle}';

-- ============================================================================
-- DONE! Your database is now up to date.
-- ============================================================================
