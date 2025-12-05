-- Migration: Add story drafts support
-- This allows users to generate multiple versions of a story and select their favorite

-- Add draft-related columns to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS parent_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS draft_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_selected_draft BOOLEAN DEFAULT false;

-- Create index for faster queries on draft relationships
CREATE INDEX IF NOT EXISTS idx_stories_parent_story_id ON stories(parent_story_id);
CREATE INDEX IF NOT EXISTS idx_stories_draft_number ON stories(draft_number);

-- Add comment explaining the draft system
COMMENT ON COLUMN stories.parent_story_id IS 'If set, this story is a draft of the parent story. NULL means it is a standalone story or the parent draft.';
COMMENT ON COLUMN stories.draft_number IS 'The draft number (1, 2, 3, etc.) for this version of the story';
COMMENT ON COLUMN stories.is_selected_draft IS 'True if this draft was selected as the final version by the user';

