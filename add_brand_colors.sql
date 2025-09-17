-- Add brand_colors to profiles table for public profile customization
-- This is a manual script to add the brand_colors column

-- Add brand_colors JSONB field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{
  "primary": "#ec4899",
  "primaryDark": "#be185d", 
  "primaryLight": "#f3e8ff",
  "secondary": "#9333ea",
  "accent": "#f59e0b",
  "textPrimary": "#1f2937",
  "background": "#ffffff",
  "border": "#e5e7eb"
}';

-- Add comment for the new column
COMMENT ON COLUMN public.profiles.brand_colors IS 'JSON object containing brand color customization for public profiles and emails';

-- Create index for better performance when querying brand colors
CREATE INDEX IF NOT EXISTS idx_profiles_brand_colors ON public.profiles USING GIN (brand_colors);

-- Update existing profiles to have default brand colors if they don't have any
UPDATE public.profiles 
SET brand_colors = '{
  "primary": "#ec4899",
  "primaryDark": "#be185d",
  "primaryLight": "#f3e8ff", 
  "secondary": "#9333ea",
  "accent": "#f59e0b",
  "textPrimary": "#1f2937",
  "background": "#ffffff",
  "border": "#e5e7eb"
}'::jsonb
WHERE brand_colors IS NULL OR brand_colors = '{}'::jsonb;
