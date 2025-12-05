-- Trigger to automatically create user profile when a user signs up
-- This bypasses RLS issues during signup

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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.usage TO anon, authenticated;






