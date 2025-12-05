-- Quick check to verify if child_profiles table exists
-- Run this in Supabase SQL Editor to check migration status
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Review the results below

-- ============================================
-- STEP 1: Check if table exists
-- ============================================
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'child_profiles'
  ) AS table_exists;

-- Expected result: table_exists = true (if migration was successful)

-- ============================================
-- STEP 2: Show table structure (if table exists)
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'child_profiles'
ORDER BY ordinal_position;

-- Expected columns:
-- - id (uuid)
-- - user_id (uuid)
-- - name (text)
-- - nickname (text, nullable)
-- - birth_date (date, nullable)
-- - appearance (jsonb)
-- - ai_generated_image_url (text, nullable)
-- - original_image_uploaded_at (timestamptz, nullable)
-- - created_at (timestamptz)
-- - updated_at (timestamptz)

-- ============================================
-- STEP 3: Check if indexes exist
-- ============================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'child_profiles';

-- Expected indexes:
-- - idx_child_profiles_user_id
-- - idx_child_profiles_name
-- - child_profiles_pkey (primary key)

-- ============================================
-- STEP 4: Check if trigger exists
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'child_profiles';

-- Expected trigger:
-- - update_child_profiles_updated_at

-- ============================================
-- VERIFICATION SUMMARY
-- ============================================
-- If all checks pass:
-- ✅ Table exists
-- ✅ All 10 columns present
-- ✅ Indexes created
-- ✅ Trigger configured
-- 
-- Migration status: SUCCESS ✅
--
-- If table_exists = false:
-- ❌ Migration has NOT been run
-- Action: Run migration file: 006_add_child_profiles.sql

