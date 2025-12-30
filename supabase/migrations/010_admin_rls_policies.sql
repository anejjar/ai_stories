-- =====================================================
-- ADMIN RLS POLICIES
-- =====================================================
-- This migration creates helper functions for admin access
-- and updates existing RLS policies to grant superadmin privileges

-- =====================================================
-- 1. CREATE HELPER FUNCTIONS
-- =====================================================

-- Check if current user is a superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_superadmin() IS 'Returns true if the current user has superadmin role';

-- =====================================================
-- 2. UPDATE USERS TABLE POLICIES
-- =====================================================

-- Superadmins can view all users, regular users can view own profile
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id OR is_superadmin());

-- Superadmins can update any user, regular users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id OR is_superadmin());

-- =====================================================
-- 3. UPDATE STORIES TABLE POLICIES
-- =====================================================

-- Superadmins can view all stories, users can view public or their own
DROP POLICY IF EXISTS "Users can view public stories" ON stories;
CREATE POLICY "Users can view public stories"
  ON stories FOR SELECT
  USING (visibility = 'public' OR auth.uid() = user_id OR is_superadmin());

-- Superadmins can delete any story (for moderation)
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id OR is_superadmin());

-- =====================================================
-- 4. UPDATE PAYMENTS TABLE POLICIES
-- =====================================================

-- Superadmins can view all payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id OR is_superadmin());

-- =====================================================
-- 5. UPDATE STORY_REPORTS TABLE POLICIES
-- =====================================================

-- Superadmins can view all reports
DROP POLICY IF EXISTS "Users can view own reports" ON story_reports;
CREATE POLICY "Users can view reports"
  ON story_reports FOR SELECT
  USING (auth.uid() = user_id OR is_superadmin());

-- Superadmins can update reports (for review and resolution)
DROP POLICY IF EXISTS "Superadmins can update reports" ON story_reports;
CREATE POLICY "Superadmins can update reports"
  ON story_reports FOR UPDATE
  USING (is_superadmin());

-- =====================================================
-- 6. UPDATE EMAIL_QUEUE TABLE POLICIES
-- =====================================================

-- Superadmins can view all email queue
DROP POLICY IF EXISTS "Users can view own email queue" ON email_queue;
CREATE POLICY "Users can view email queue"
  ON email_queue FOR SELECT
  USING (auth.uid() = user_id OR is_superadmin());

-- =====================================================
-- 7. UPDATE FEATURED_STORIES TABLE POLICIES
-- =====================================================

-- Superadmins can manage featured stories
DROP POLICY IF EXISTS "Superadmins can manage featured stories" ON featured_stories;
CREATE POLICY "Superadmins can manage featured stories"
  ON featured_stories FOR ALL
  USING (is_superadmin());

-- Anyone can view featured stories
DROP POLICY IF EXISTS "Anyone can view featured stories" ON featured_stories;
CREATE POLICY "Anyone can view featured stories"
  ON featured_stories FOR SELECT
  USING (true);

-- =====================================================
-- 8. UPDATE CHILD_PROFILES TABLE POLICIES
-- =====================================================

-- Superadmins can view all child profiles
DROP POLICY IF EXISTS "Users can view own child profiles" ON child_profiles;
CREATE POLICY "Users can view own child profiles"
  ON child_profiles FOR SELECT
  USING (auth.uid() = user_id OR is_superadmin());

-- =====================================================
-- 9. ADMIN ACTIVITY LOG TABLE POLICIES
-- =====================================================

-- Enable RLS on admin_activity_log
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Superadmins can view all activity logs
DROP POLICY IF EXISTS "Superadmins can view activity log" ON admin_activity_log;
CREATE POLICY "Superadmins can view activity log"
  ON admin_activity_log FOR SELECT
  USING (is_superadmin());

-- Superadmins can insert their own activity logs
DROP POLICY IF EXISTS "Superadmins can insert activity log" ON admin_activity_log;
CREATE POLICY "Superadmins can insert activity log"
  ON admin_activity_log FOR INSERT
  WITH CHECK (is_superadmin() AND auth.uid() = admin_id);

-- =====================================================
-- 10. STORY LIKES, COMMENTS, RATINGS POLICIES
-- =====================================================

-- Superadmins can view all story likes
DROP POLICY IF EXISTS "Users can view story likes" ON story_likes;
CREATE POLICY "Users can view story likes"
  ON story_likes FOR SELECT
  USING (true); -- Already public, but ensure superadmins have access

-- Superadmins can view all story comments
DROP POLICY IF EXISTS "Users can view story comments" ON story_comments;
CREATE POLICY "Users can view story comments"
  ON story_comments FOR SELECT
  USING (true); -- Already public for public stories

-- Superadmins can view all story ratings
DROP POLICY IF EXISTS "Users can view story ratings" ON story_ratings;
CREATE POLICY "Users can view story ratings"
  ON story_ratings FOR SELECT
  USING (true); -- Already public

-- =====================================================
-- 11. READING SESSIONS POLICIES
-- =====================================================

-- Superadmins can view all reading sessions (for analytics)
DROP POLICY IF EXISTS "Users can view own reading sessions" ON reading_sessions;
CREATE POLICY "Users can view own reading sessions"
  ON reading_sessions FOR SELECT
  USING (auth.uid() = user_id OR is_superadmin());

COMMENT ON POLICY "Users can read own profile" ON users IS 'Users can view their own profile, superadmins can view all profiles';
COMMENT ON POLICY "Superadmins can view activity log" ON admin_activity_log IS 'Only superadmins can view the admin activity audit log';
