-- Add appearance column to stories table for PRO MAX customization
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS appearance JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN stories.appearance IS 'Child appearance customization data (PRO MAX only): {skinTone, hairColor, hairStyle}';

