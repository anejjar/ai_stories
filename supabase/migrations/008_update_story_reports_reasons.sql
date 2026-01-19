-- =====================================================
-- UPDATE STORY REPORTS REASON CHECK CONSTRAINT
-- =====================================================
-- Add new report reasons: unwanted_words, unwanted_images, image_issues

-- Drop the old constraint
ALTER TABLE story_reports 
DROP CONSTRAINT IF EXISTS story_reports_reason_check;

-- Add the new constraint with all report reasons
ALTER TABLE story_reports 
ADD CONSTRAINT story_reports_reason_check 
CHECK (reason IN (
  'inappropriate', 
  'spam', 
  'copyright', 
  'unwanted_words',
  'unwanted_images',
  'image_issues',
  'other'
));

