-- Migration: Add child profiles for PRO MAX users
-- Allows parents to create and manage profiles for multiple children

-- Child profiles table
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  birth_date DATE,
  appearance JSONB DEFAULT '{}', -- { skinTone, hairColor, hairStyle }
  ai_generated_image_url TEXT, -- AI-processed version of uploaded image (safe)
  original_image_uploaded_at TIMESTAMPTZ, -- Track when original was uploaded (but not stored)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name) -- One profile per child name per user
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_name ON child_profiles(name);

-- Add comment explaining the image safety
COMMENT ON TABLE child_profiles IS 'Child profiles for PRO MAX users. Original images are processed by AI and only AI-generated versions are stored. Original images are never stored.';
COMMENT ON COLUMN child_profiles.ai_generated_image_url IS 'AI-generated safe version of the child image. Original image is never stored.';
COMMENT ON COLUMN child_profiles.original_image_uploaded_at IS 'Timestamp when original image was uploaded (for tracking). Original image is processed and deleted immediately.';

-- Add trigger to update updated_at
CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


