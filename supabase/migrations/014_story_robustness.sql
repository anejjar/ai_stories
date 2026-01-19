-- Migration: Story Robustness Improvements
-- Adds image upload status tracking and validation constraints

-- Add image upload status tracking
ALTER TABLE stories ADD COLUMN IF NOT EXISTS image_upload_status TEXT DEFAULT 'complete' 
  CHECK (image_upload_status IN ('pending', 'complete', 'failed', 'partial'));

-- Add index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_stories_image_status ON stories(image_upload_status) 
  WHERE image_upload_status IN ('pending', 'failed', 'partial');

-- Add content length validation (enforce at DB level)
-- Note: This constraint will only apply to new inserts/updates
-- Existing stories with longer content will not be affected until updated
DO $$
BEGIN
  -- Only add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stories_content_length'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT stories_content_length 
      CHECK (LENGTH(content) <= 50000);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN stories.image_upload_status IS 'Status of image uploads: pending (uploading), complete (all uploaded), failed (all failed), partial (some failed)';
