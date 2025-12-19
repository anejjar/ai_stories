-- Functions and triggers for AI Stories app
-- This includes user signup handling, achievements, email preferences, and social features

-- =====================================================
-- USER SIGNUP TRIGGER
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    'trial'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize trial usage
  INSERT INTO public.usage (user_id, stories_generated, trial_completed)
  VALUES (NEW.id, 0, false)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.usage TO anon, authenticated;

-- =====================================================
-- CHILD PROFILE LIMIT ENFORCEMENT
-- =====================================================

-- Function to check child profile count
CREATE OR REPLACE FUNCTION check_child_profile_limit()
RETURNS TRIGGER AS $$
DECLARE
  profile_count INTEGER;
  user_tier TEXT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM users
  WHERE id = NEW.user_id;

  -- Count existing profiles for this user
  SELECT COUNT(*) INTO profile_count
  FROM child_profiles
  WHERE user_id = NEW.user_id;

  -- Enforce limits based on tier
  IF user_tier = 'family' AND profile_count >= 3 THEN
    RAISE EXCEPTION 'Family Plan allows maximum 3 child profiles. Please upgrade or remove a profile.';
  ELSIF user_tier = 'pro' AND profile_count >= 2 THEN
    RAISE EXCEPTION 'Pro Plan allows maximum 2 child profiles. Please upgrade to Family Plan.';
  ELSIF user_tier = 'trial' AND profile_count >= 1 THEN
    RAISE EXCEPTION 'Trial users can create 1 child profile. Please upgrade to create more.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to enforce limit
DROP TRIGGER IF EXISTS enforce_child_profile_limit ON child_profiles;
CREATE TRIGGER enforce_child_profile_limit
  BEFORE INSERT ON child_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_child_profile_limit();

-- =====================================================
-- USAGE TRACKING FUNCTIONS
-- =====================================================

-- Function to get or create daily usage record
CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Try to get existing record
  SELECT id INTO v_usage_id
  FROM daily_usage
  WHERE user_id = p_user_id AND usage_date = p_date;

  -- Create if doesn't exist
  IF v_usage_id IS NULL THEN
    INSERT INTO daily_usage (user_id, usage_date)
    VALUES (p_user_id, p_date)
    RETURNING id INTO v_usage_id;
  END IF;

  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create story (rolling window)
CREATE OR REPLACE FUNCTION can_create_story(
  p_user_id UUID,
  p_is_illustrated BOOLEAN,
  OUT can_create BOOLEAN,
  OUT reason TEXT,
  OUT reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_tier TEXT;
  v_usage_record RECORD;
  v_hours_since_first NUMERIC;
  v_limit INTEGER;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO v_tier
  FROM users
  WHERE id = p_user_id;

  -- Trial users have separate limit system (handled in trial-service)
  IF v_tier = 'trial' THEN
    can_create := TRUE;
    reason := 'Trial tier uses separate limit system';
    RETURN;
  END IF;

  -- Pro users: unlimited
  IF v_tier = 'pro' THEN
    can_create := TRUE;
    reason := 'Pro tier has unlimited stories';
    RETURN;
  END IF;

  -- Family tier: enforce rolling 24-hour limits
  IF v_tier = 'family' THEN
    -- Get today's usage
    SELECT * INTO v_usage_record
    FROM daily_usage
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;

    -- No usage record means first story of the day
    IF v_usage_record IS NULL THEN
      can_create := TRUE;
      reason := 'First story of the day';
      RETURN;
    END IF;

    -- Check illustrated story limit (2 per 24 hours)
    IF p_is_illustrated THEN
      v_limit := 2;

      -- If no illustrated stories yet today
      IF v_usage_record.first_illustrated_story_at IS NULL THEN
        can_create := TRUE;
        reason := 'First illustrated story of the day';
        RETURN;
      END IF;

      -- Calculate hours since first illustrated story
      v_hours_since_first := EXTRACT(EPOCH FROM (NOW() - v_usage_record.first_illustrated_story_at)) / 3600;

      -- If within 24-hour window
      IF v_hours_since_first < 24 THEN
        IF v_usage_record.illustrated_stories_count >= v_limit THEN
          can_create := FALSE;
          reason := format('Family Plan limit: %s illustrated stories per 24 hours', v_limit);
          reset_at := v_usage_record.first_illustrated_story_at + INTERVAL '24 hours';
          RETURN;
        END IF;
      ELSE
        -- Window expired, reset counters (will be handled in increment function)
        can_create := TRUE;
        reason := '24-hour window expired, counters reset';
        RETURN;
      END IF;

    -- Check text story limit (10 per 24 hours)
    ELSE
      v_limit := 10;

      -- If no text stories yet today
      IF v_usage_record.first_text_story_at IS NULL THEN
        can_create := TRUE;
        reason := 'First text story of the day';
        RETURN;
      END IF;

      -- Calculate hours since first text story
      v_hours_since_first := EXTRACT(EPOCH FROM (NOW() - v_usage_record.first_text_story_at)) / 3600;

      -- If within 24-hour window
      IF v_hours_since_first < 24 THEN
        IF v_usage_record.text_stories_count >= v_limit THEN
          can_create := FALSE;
          reason := format('Family Plan limit: %s text stories per 24 hours', v_limit);
          reset_at := v_usage_record.first_text_story_at + INTERVAL '24 hours';
          RETURN;
        END IF;
      ELSE
        -- Window expired
        can_create := TRUE;
        reason := '24-hour window expired, counters reset';
        RETURN;
      END IF;
    END IF;

    -- If we got here, user is within limit
    can_create := TRUE;
    reason := 'Within daily limit';
    RETURN;
  END IF;

  -- Default: allow (shouldn't reach here)
  can_create := TRUE;
  reason := 'No restrictions apply';
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_story_usage(
  p_user_id UUID,
  p_is_illustrated BOOLEAN
) RETURNS VOID AS $$
DECLARE
  v_usage_record RECORD;
  v_hours_since_first NUMERIC;
BEGIN
  -- Get or create today's record
  SELECT * INTO v_usage_record
  FROM daily_usage
  WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;

  IF v_usage_record IS NULL THEN
    -- Create new record
    INSERT INTO daily_usage (
      user_id,
      usage_date,
      text_stories_count,
      illustrated_stories_count,
      first_text_story_at,
      first_illustrated_story_at
    ) VALUES (
      p_user_id,
      CURRENT_DATE,
      CASE WHEN NOT p_is_illustrated THEN 1 ELSE 0 END,
      CASE WHEN p_is_illustrated THEN 1 ELSE 0 END,
      CASE WHEN NOT p_is_illustrated THEN NOW() ELSE NULL END,
      CASE WHEN p_is_illustrated THEN NOW() ELSE NULL END
    );
  ELSE
    -- Update existing record
    IF p_is_illustrated THEN
      -- Check if 24-hour window expired
      IF v_usage_record.first_illustrated_story_at IS NOT NULL THEN
        v_hours_since_first := EXTRACT(EPOCH FROM (NOW() - v_usage_record.first_illustrated_story_at)) / 3600;

        IF v_hours_since_first >= 24 THEN
          -- Reset counter
          UPDATE daily_usage
          SET
            illustrated_stories_count = 1,
            first_illustrated_story_at = NOW(),
            updated_at = NOW()
          WHERE id = v_usage_record.id;
          RETURN;
        END IF;
      END IF;

      -- Increment counter
      UPDATE daily_usage
      SET
        illustrated_stories_count = illustrated_stories_count + 1,
        first_illustrated_story_at = COALESCE(first_illustrated_story_at, NOW()),
        updated_at = NOW()
      WHERE id = v_usage_record.id;

    ELSE
      -- Check if 24-hour window expired for text stories
      IF v_usage_record.first_text_story_at IS NOT NULL THEN
        v_hours_since_first := EXTRACT(EPOCH FROM (NOW() - v_usage_record.first_text_story_at)) / 3600;

        IF v_hours_since_first >= 24 THEN
          -- Reset counter
          UPDATE daily_usage
          SET
            text_stories_count = 1,
            first_text_story_at = NOW(),
            updated_at = NOW()
          WHERE id = v_usage_record.id;
          RETURN;
        END IF;
      END IF;

      -- Increment counter
      UPDATE daily_usage
      SET
        text_stories_count = text_stories_count + 1,
        first_text_story_at = COALESCE(first_text_story_at, NOW()),
        updated_at = NOW()
      WHERE id = v_usage_record.id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- READING STREAK FUNCTIONS
-- =====================================================

-- Function to update reading streak
CREATE OR REPLACE FUNCTION update_reading_streak(user_uuid UUID)
RETURNS void AS $$
DECLARE
  last_read DATE;
  current_streak INTEGER;
  longest_streak INTEGER;
BEGIN
  -- Get current user data
  SELECT last_read_date, reading_streak_current, reading_streak_longest
  INTO last_read, current_streak, longest_streak
  FROM users
  WHERE id = user_uuid;

  -- If no previous read date, start streak at 1
  IF last_read IS NULL THEN
    UPDATE users
    SET reading_streak_current = 1,
        reading_streak_longest = 1,
        last_read_date = CURRENT_DATE
    WHERE id = user_uuid;
    RETURN;
  END IF;

  -- If last read was today, do nothing (already counted)
  IF last_read = CURRENT_DATE THEN
    RETURN;
  END IF;

  -- If last read was yesterday, increment streak
  IF last_read = CURRENT_DATE - INTERVAL '1 day' THEN
    current_streak := current_streak + 1;
    IF current_streak > longest_streak THEN
      longest_streak := current_streak;
    END IF;
  -- If last read was before yesterday, reset streak
  ELSE
    current_streak := 1;
  END IF;

  -- Update user
  UPDATE users
  SET reading_streak_current = current_streak,
      reading_streak_longest = longest_streak,
      last_read_date = CURRENT_DATE
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ACHIEVEMENT CHECKING FUNCTIONS
-- =====================================================

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(user_uuid UUID)
RETURNS TABLE(achievement_id TEXT, newly_unlocked BOOLEAN) AS $$
DECLARE
  story_count INTEGER;
  current_streak INTEGER;
  unique_themes INTEGER;
  illustrated_count INTEGER;
  achievement RECORD;
  has_achievement BOOLEAN;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO story_count FROM stories WHERE user_id = user_uuid;
  SELECT reading_streak_current INTO current_streak FROM users WHERE id = user_uuid;
  SELECT COUNT(DISTINCT theme) INTO unique_themes FROM stories WHERE user_id = user_uuid;
  SELECT COUNT(*) INTO illustrated_count FROM stories WHERE user_id = user_uuid AND is_illustrated_book = true;

  -- Check each achievement
  FOR achievement IN SELECT * FROM achievements LOOP
    -- Check if user already has this achievement
    SELECT EXISTS(
      SELECT 1 FROM user_achievements
      WHERE user_achievements.user_id = user_uuid AND user_achievements.achievement_id = achievement.id
    ) INTO has_achievement;

    -- Skip if already has achievement
    IF has_achievement THEN
      CONTINUE;
    END IF;

    -- Check if user qualifies for this achievement
    CASE achievement.requirement_type
      WHEN 'story_count' THEN
        IF story_count >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id, progress)
          VALUES (user_uuid, achievement.id, story_count);

          RETURN QUERY SELECT achievement.id, TRUE;
        END IF;

      WHEN 'streak_days' THEN
        IF current_streak >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id, progress)
          VALUES (user_uuid, achievement.id, current_streak);

          RETURN QUERY SELECT achievement.id, TRUE;
        END IF;

      WHEN 'theme_count' THEN
        IF unique_themes >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id, progress)
          VALUES (user_uuid, achievement.id, unique_themes);

          RETURN QUERY SELECT achievement.id, TRUE;
        END IF;

      ELSE
        -- Special achievements handled manually
        NULL;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_reading_streak TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_achievements TO authenticated;

-- =====================================================
-- EMAIL PREFERENCE FUNCTIONS
-- =====================================================

-- Function to create default email preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create email preferences on user signup
DROP TRIGGER IF EXISTS create_email_preferences_trigger ON auth.users;
CREATE TRIGGER create_email_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Function to get weekly summary data
CREATE OR REPLACE FUNCTION get_weekly_summary(user_uuid UUID)
RETURNS TABLE(
  stories_created INTEGER,
  stories_read INTEGER,
  total_reading_time INTEGER,
  achievements_unlocked INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  themes_explored INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH week_data AS (
    -- Stories created this week
    SELECT COUNT(*) as stories_created
    FROM stories
    WHERE user_id = user_uuid
      AND created_at >= NOW() - INTERVAL '7 days'
  ),
  reading_data AS (
    -- Reading sessions this week
    SELECT
      COUNT(*) as stories_read,
      COALESCE(SUM(duration_seconds), 0) as total_reading_time
    FROM reading_sessions
    WHERE user_id = user_uuid
      AND read_at >= NOW() - INTERVAL '7 days'
  ),
  achievement_data AS (
    -- Achievements unlocked this week
    SELECT COUNT(*) as achievements_unlocked
    FROM user_achievements
    WHERE user_id = user_uuid
      AND unlocked_at >= NOW() - INTERVAL '7 days'
  ),
  user_data AS (
    -- Current user stats
    SELECT
      reading_streak_current,
      reading_streak_longest
    FROM users
    WHERE id = user_uuid
  ),
  theme_data AS (
    -- Unique themes this week
    SELECT COUNT(DISTINCT theme) as themes_explored
    FROM stories
    WHERE user_id = user_uuid
      AND created_at >= NOW() - INTERVAL '7 days'
  )
  SELECT
    w.stories_created::INTEGER,
    r.stories_read::INTEGER,
    r.total_reading_time::INTEGER,
    a.achievements_unlocked::INTEGER,
    u.reading_streak_current::INTEGER,
    u.reading_streak_longest::INTEGER,
    t.themes_explored::INTEGER
  FROM week_data w, reading_data r, achievement_data a, user_data u, theme_data t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_weekly_summary TO authenticated;

-- =====================================================
-- SOCIAL FEATURE COUNTER FUNCTIONS
-- =====================================================

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_story_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET comments_count = comments_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_story_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories
  SET
    average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM story_ratings WHERE story_id = NEW.story_id),
    ratings_count = (SELECT COUNT(*) FROM story_ratings WHERE story_id = NEW.story_id)
  WHERE id = NEW.story_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS FOR SOCIAL COUNTERS
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_likes_count ON story_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON story_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_likes_count();

DROP TRIGGER IF EXISTS trigger_update_comments_count ON story_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON story_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_story_comments_count();

DROP TRIGGER IF EXISTS trigger_update_rating ON story_ratings;
CREATE TRIGGER trigger_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON story_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_story_rating();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Create a function to get safe user display info (for comments, etc.)
CREATE OR REPLACE FUNCTION get_user_display_info(user_uuid UUID)
RETURNS TABLE (
  display_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(users.display_name, SPLIT_PART(users.email, '@', 1)) as display_name,
    users.avatar_url
  FROM users
  WHERE users.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION COMMENTS
-- =====================================================

COMMENT ON FUNCTION update_reading_streak IS 'Updates user reading streak when they read a story';
COMMENT ON FUNCTION check_and_award_achievements IS 'Checks user progress and awards new achievements';
COMMENT ON FUNCTION get_weekly_summary IS 'Gets weekly reading stats for email summaries';
COMMENT ON FUNCTION get_user_display_info IS 'Returns safe user display info for public profiles';
