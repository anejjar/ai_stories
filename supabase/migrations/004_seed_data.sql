-- Seed data for AI Stories app
-- This populates initial data like achievements

-- =====================================================
-- INSERT DEFAULT ACHIEVEMENTS
-- =====================================================

INSERT INTO achievements (id, name, description, category, icon, requirement_type, requirement_value, points, tier) VALUES
  -- Milestone Achievements
  ('first_story', 'Story Starter', 'Created your first story', 'milestone', '🎉', 'story_count', 1, 10, 'bronze'),
  ('story_10', 'Rising Author', 'Created 10 stories', 'milestone', '📚', 'story_count', 10, 25, 'silver'),
  ('story_25', 'Prolific Writer', 'Created 25 stories', 'milestone', '✨', 'story_count', 25, 50, 'gold'),
  ('story_50', 'Story Master', 'Created 50 stories', 'milestone', '🏆', 'story_count', 50, 100, 'platinum'),
  ('story_100', 'Legendary Author', 'Created 100 stories', 'milestone', '👑', 'story_count', 100, 250, 'diamond'),

  -- Streak Achievements
  ('streak_3', 'Getting Started', 'Read stories for 3 days in a row', 'streak', '🔥', 'streak_days', 3, 15, 'bronze'),
  ('streak_7', 'Week Warrior', 'Read stories for 7 days in a row', 'streak', '🌟', 'streak_days', 7, 30, 'silver'),
  ('streak_14', 'Two Week Hero', 'Read stories for 14 days in a row', 'streak', '⚡', 'streak_days', 14, 60, 'gold'),
  ('streak_30', 'Monthly Master', 'Read stories for 30 days in a row', 'streak', '💫', 'streak_days', 30, 120, 'platinum'),
  ('streak_100', 'Century Champion', 'Read stories for 100 days in a row', 'streak', '🎖️', 'streak_days', 100, 500, 'diamond'),

  -- Explorer Achievements
  ('theme_5', 'Theme Explorer', 'Created stories with 5 different themes', 'explorer', '🗺️', 'theme_count', 5, 20, 'bronze'),
  ('theme_10', 'Genre Master', 'Created stories with 10 different themes', 'explorer', '🌍', 'theme_count', 10, 40, 'silver'),
  ('theme_all', 'Universal Creator', 'Created stories with all available themes', 'explorer', '🌌', 'theme_count', 25, 100, 'gold'),

  -- Creator Achievements
  ('illustrated_first', 'Picture Perfect', 'Created your first illustrated story', 'creator', '🎨', 'special', 1, 30, 'silver'),
  ('illustrated_10', 'Book Illustrator', 'Created 10 illustrated stories', 'creator', '📖', 'special', 10, 75, 'gold'),

  -- Special Achievements
  ('early_bird', 'Early Bird', 'Read a story before 8 AM', 'special', '🌅', 'special', 1, 15, 'bronze'),
  ('night_owl', 'Night Owl', 'Read a story after 10 PM', 'special', '🦉', 'special', 1, 15, 'bronze'),
  ('weekend_reader', 'Weekend Warrior', 'Read stories on Saturday and Sunday', 'special', '📅', 'special', 1, 20, 'bronze')
ON CONFLICT (id) DO NOTHING;
