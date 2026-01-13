-- Row Level Security (RLS) policies for AI Stories app

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_story_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

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

-- =====================================================
-- STORIES TABLE POLICIES
-- =====================================================

-- Users can read public stories or their own stories
DROP POLICY IF EXISTS "Users can read own stories" ON stories;
DROP POLICY IF EXISTS "Users can view public stories" ON stories;
CREATE POLICY "Users can view public stories"
  ON stories FOR SELECT
  USING (visibility = 'public' OR auth.uid() = user_id);

-- Users can insert their own stories
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stories
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own stories
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CHILD PROFILES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own child profiles" ON child_profiles;
CREATE POLICY "Users can view own child profiles"
  ON child_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own child profiles" ON child_profiles;
CREATE POLICY "Users can insert own child profiles"
  ON child_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own child profiles" ON child_profiles;
CREATE POLICY "Users can update own child profiles"
  ON child_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own child profiles" ON child_profiles;
CREATE POLICY "Users can delete own child profiles"
  ON child_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USAGE TABLE POLICIES
-- =====================================================

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

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own payments" ON payments;
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- DAILY USAGE TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own daily usage" ON daily_usage;
CREATE POLICY "Users can view own daily usage"
  ON daily_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily usage" ON daily_usage;
CREATE POLICY "Users can insert own daily usage"
  ON daily_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily usage" ON daily_usage;
CREATE POLICY "Users can update own daily usage"
  ON daily_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FEATURED STORIES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view featured stories" ON featured_stories;
CREATE POLICY "Anyone can view featured stories"
  ON featured_stories FOR SELECT
  USING (is_active = true);

-- =====================================================
-- SHARED STORY TOKENS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their shared tokens" ON shared_story_tokens;
CREATE POLICY "Users can view their shared tokens"
  ON shared_story_tokens FOR SELECT
  USING (auth.uid() = shared_by);

DROP POLICY IF EXISTS "Users can create shared tokens" ON shared_story_tokens;
CREATE POLICY "Users can create shared tokens"
  ON shared_story_tokens FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

-- =====================================================
-- ACHIEVEMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- =====================================================
-- USER ACHIEVEMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievement unlocks" ON user_achievements;
CREATE POLICY "Users can insert their own achievement unlocks"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own achievements" ON user_achievements;
CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- READING SESSIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own reading sessions" ON reading_sessions;
CREATE POLICY "Users can view their own reading sessions"
  ON reading_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reading sessions" ON reading_sessions;
CREATE POLICY "Users can insert their own reading sessions"
  ON reading_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- VOICE PROFILES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own voice profiles" ON voice_profiles;
CREATE POLICY "Users can view their own voice profiles"
  ON voice_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own voice profiles" ON voice_profiles;
CREATE POLICY "Users can insert their own voice profiles"
  ON voice_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own voice profiles" ON voice_profiles;
CREATE POLICY "Users can update their own voice profiles"
  ON voice_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own voice profiles" ON voice_profiles;
CREATE POLICY "Users can delete their own voice profiles"
  ON voice_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- EMAIL PREFERENCES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own email preferences" ON email_preferences;
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own email preferences" ON email_preferences;
CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own email preferences" ON email_preferences;
CREATE POLICY "Users can update their own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- EMAIL QUEUE TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own email queue" ON email_queue;
CREATE POLICY "Users can view their own email queue"
  ON email_queue FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- STORY LIKES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view likes" ON story_likes;
CREATE POLICY "Users can view likes"
  ON story_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their likes" ON story_likes;
CREATE POLICY "Users can manage their likes"
  ON story_likes FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- STORY COMMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view comments on public stories" ON story_comments;
CREATE POLICY "Users can view comments on public stories"
  ON story_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_comments.story_id
      AND (stories.visibility = 'public' OR stories.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create comments on public stories" ON story_comments;
CREATE POLICY "Users can create comments on public stories"
  ON story_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_comments.story_id
      AND stories.visibility = 'public'
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON story_comments;
CREATE POLICY "Users can update their own comments"
  ON story_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON story_comments;
CREATE POLICY "Users can delete their own comments"
  ON story_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- STORY RATINGS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view ratings" ON story_ratings;
CREATE POLICY "Users can view ratings"
  ON story_ratings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their ratings on public stories" ON story_ratings;
CREATE POLICY "Users can manage their ratings on public stories"
  ON story_ratings FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_ratings.story_id
      AND stories.visibility = 'public'
    )
  );

-- =====================================================
-- STORY REPORTS TABLE POLICIES
-- =====================================================DROP POLICY IF EXISTS "Users can create reports" ON story_reports;
CREATE POLICY "Users can create reports"
  ON story_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);DROP POLICY IF EXISTS "Users can view their own reports" ON story_reports;
CREATE POLICY "Users can view their own reports"
  ON story_reports FOR SELECT
  USING (auth.uid() = user_id);
