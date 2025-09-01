-- Add policy to allow public access to profiles where is_profile_public = true
CREATE POLICY "Anyone can view public profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (is_profile_public = true);