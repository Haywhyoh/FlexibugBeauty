-- Add image_url column to services table
-- Run this in your Supabase SQL Editor

-- Add the column
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.services.image_url IS 'URL to the service image stored in Supabase storage';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name = 'image_url';