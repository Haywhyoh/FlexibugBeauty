-- Add brand colors column to profiles table
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