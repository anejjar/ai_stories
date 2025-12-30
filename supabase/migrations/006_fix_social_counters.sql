-- Fix social counter functions to use SECURITY DEFINER
-- This allows triggers to update story counts even if the user doesn't have update permissions on the story

-- 1. Update Likes Count Function
CREATE OR REPLACE FUNCTION public.update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.stories 
    SET likes_count = COALESCE(likes_count, 0) + 1 
    WHERE id = NEW.story_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.stories 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
    WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Comments Count Function
CREATE OR REPLACE FUNCTION public.update_story_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.stories 
    SET comments_count = COALESCE(comments_count, 0) + 1 
    WHERE id = NEW.story_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.stories 
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) 
    WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Rating Function
CREATE OR REPLACE FUNCTION public.update_story_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stories
  SET
    average_rating = (SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2) FROM public.story_ratings WHERE story_id = NEW.story_id),
    ratings_count = (SELECT COUNT(*) FROM public.story_ratings WHERE story_id = NEW.story_id)
  WHERE id = NEW.story_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create View Count Increment Function
CREATE OR REPLACE FUNCTION public.increment_story_view_count(story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the RPC function
GRANT EXECUTE ON FUNCTION public.increment_story_view_count(UUID) TO authenticated, anon;




