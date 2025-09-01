-- Add image_url column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.services.image_url IS 'URL to the service image stored in Supabase storage';