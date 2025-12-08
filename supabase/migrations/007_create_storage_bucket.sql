-- Create storage bucket for story images
-- Note: This migration creates the bucket if it doesn't exist
-- You may need to create it manually in Supabase Dashboard if this doesn't work

-- Insert bucket configuration (if using SQL to create bucket)
-- Note: Supabase Storage buckets are typically created via the dashboard or API
-- This is a placeholder migration - you may need to create the bucket manually

-- Storage policies will be set up separately via RLS policies
-- For now, we'll use the admin client which bypasses RLS

-- To create the bucket manually:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: "stories"
-- 4. Public: true (if you want public access)
-- 5. File size limit: 10MB (or as needed)
-- 6. Allowed MIME types: image/*

-- Storage policies (if bucket is public, these may not be needed)
-- But for security, we can add policies:

-- Allow authenticated users to upload images
-- CREATE POLICY "Users can upload story images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'stories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to story images
-- CREATE POLICY "Public can read story images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'stories');

