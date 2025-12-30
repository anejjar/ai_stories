-- =====================================================
-- ADMIN ROLES MIGRATION
-- =====================================================
-- This migration adds admin/superadmin role support to the application
-- with comprehensive activity logging for audit trails

-- =====================================================
-- 1. ADD ROLE FIELD TO USERS TABLE
-- =====================================================

-- Add role column with check constraint
ALTER TABLE users
ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'superadmin'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add admin activity tracking fields
ALTER TABLE users
ADD COLUMN last_admin_action_at TIMESTAMPTZ,
ADD COLUMN admin_notes TEXT;

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: user (default) or superadmin';
COMMENT ON COLUMN users.last_admin_action_at IS 'Timestamp of last admin action performed by this user';
COMMENT ON COLUMN users.admin_notes IS 'Private notes about this user (visible to admins only)';

-- =====================================================
-- 2. CREATE ADMIN ACTIVITY LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'user_view',
    'user_edit',
    'subscription_change',
    'story_review',
    'story_delete',
    'report_review'
  )),
  target_id UUID, -- ID of affected resource (user, story, report, etc.)
  target_type TEXT, -- Type of resource (user, story, report, etc.)
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for admin activity log
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id
  ON admin_activity_log(admin_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_target
  ON admin_activity_log(target_id, target_type);

CREATE INDEX IF NOT EXISTS idx_admin_activity_type
  ON admin_activity_log(action_type, created_at DESC);

-- Add comment
COMMENT ON TABLE admin_activity_log IS 'Audit trail for all admin actions - tracks who did what and when';
COMMENT ON COLUMN admin_activity_log.admin_id IS 'User ID of the admin who performed the action';
COMMENT ON COLUMN admin_activity_log.action_type IS 'Type of action performed';
COMMENT ON COLUMN admin_activity_log.target_id IS 'ID of the resource that was affected (if applicable)';
COMMENT ON COLUMN admin_activity_log.target_type IS 'Type of resource (user, story, report, etc.)';
COMMENT ON COLUMN admin_activity_log.details IS 'Additional context about the action (JSONB format)';

-- =====================================================
-- 3. CREATE TRIGGER TO UPDATE LAST_ADMIN_ACTION_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_admin_action_at = NOW()
  WHERE id = NEW.admin_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_last_admin_action
  AFTER INSERT ON admin_activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_last_admin_action();

COMMENT ON FUNCTION update_last_admin_action() IS 'Automatically updates last_admin_action_at when admin activity is logged';

-- =====================================================
-- 4. ENHANCE STORY_REPORTS TABLE
-- =====================================================

-- Add admin review fields to story_reports
ALTER TABLE story_reports
ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS action_taken TEXT CHECK (action_taken IN (
  'no_action',
  'warning_sent',
  'story_hidden',
  'story_deleted',
  'user_warned',
  'user_suspended'
));

-- Add index for admin queries
CREATE INDEX IF NOT EXISTS idx_story_reports_reviewed_by
  ON story_reports(reviewed_by, reviewed_at DESC);

-- Add comments
COMMENT ON COLUMN story_reports.resolution_notes IS 'Admin notes about how the report was resolved';
COMMENT ON COLUMN story_reports.action_taken IS 'Action taken by admin in response to this report';
