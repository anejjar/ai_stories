-- Migration: Add multi-child story support
-- This allows stories to feature multiple children (siblings, friends, etc.)

-- Add children column as JSONB to store array of child information
-- This keeps backward compatibility with child_name while adding multi-child support
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS children JSONB DEFAULT NULL;

-- Create index for querying children data
CREATE INDEX IF NOT EXISTS idx_stories_children ON stories USING GIN (children);

-- Add comment explaining the children structure
COMMENT ON COLUMN stories.children IS 'JSONB array of child objects: [{"name": "Emma", "adjectives": ["brave", "kind"], "appearance": {...}}, ...]. If NULL, use child_name for backward compatibility.';

-- Migrate existing data: convert single child_name to children array format
UPDATE stories 
SET children = jsonb_build_array(
  jsonb_build_object(
    'name', child_name,
    'adjectives', adjectives,
    'appearance', appearance
  )
)
WHERE children IS NULL AND child_name IS NOT NULL;

