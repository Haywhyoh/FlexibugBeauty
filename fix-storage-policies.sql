-- Fix storage policies for service-images bucket
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to service images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their service images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their service images" ON storage.objects;

-- Create policy to allow authenticated users to upload service images
CREATE POLICY "Authenticated users can upload service images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow public read access to service images
CREATE POLICY "Public read access to service images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-images');

-- Create policy to allow users to update their own service images
-- (Allow any authenticated user to update since we're not tracking ownership at storage level)
CREATE POLICY "Users can update their service images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own service images
-- (Allow any authenticated user to delete since we're not tracking ownership at storage level)
CREATE POLICY "Users can delete their service images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Verify policies were created
SELECT 
  policyname, 
  cmd, 
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%service images%'
ORDER BY policyname;