-- Apply required migrations for cover image and public profile functionality
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Add policy to allow public access to profiles where is_profile_public = true
CREATE POLICY "Anyone can view public profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (is_profile_public = true);

-- 2. Add cover_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'cover_url';

-- Check if the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname = 'Anyone can view public profiles';