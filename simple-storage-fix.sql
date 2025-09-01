-- Simple storage policy fix for service-images
-- Run this in your Supabase SQL Editor

-- Allow authenticated users to upload to service-images bucket
CREATE POLICY IF NOT EXISTS "service_images_upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);

-- Allow public read access to service-images
CREATE POLICY IF NOT EXISTS "service_images_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-images');

-- Allow authenticated users to delete from service-images  
CREATE POLICY IF NOT EXISTS "service_images_delete" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);

-- Show current policies for verification
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%service_images%' OR policyname LIKE '%service images%');