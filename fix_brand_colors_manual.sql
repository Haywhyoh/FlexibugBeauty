-- Manual SQL to add brand_colors column to profiles table
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Add the brand_colors column
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

-- Step 2: Add comment for documentation
COMMENT ON COLUMN public.profiles.brand_colors IS 'JSON object containing brand color customization for public profiles and emails';

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_brand_colors ON public.profiles USING GIN (brand_colors);

-- Step 4: Update existing profiles with default brand colors
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

-- Step 5: Verify the column was created
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'brand_colors';