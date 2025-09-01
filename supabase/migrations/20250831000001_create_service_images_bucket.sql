-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

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
CREATE POLICY "Users can update their service images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own service images
CREATE POLICY "Users can delete their service images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);