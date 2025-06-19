-- DIRECT FIX for existing clients based on console logs
-- Run this in Supabase SQL Editor

-- First, let's see what user data we have for the specific users from the logs
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data ->> 'full_name' as full_name_from_metadata,
  au.raw_user_meta_data ->> 'phone' as phone_from_metadata,
  au.raw_user_meta_data ->> 'user_type' as user_type,
  au.raw_user_meta_data
FROM auth.users au
WHERE au.id IN (
  '9355093a-8fe4-4c3d-bf0b-72d86a67991b',
  'a83f4584-8d96-4dc9-b81f-00aa816ddb24'
);

-- Check if profiles exist for these users
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.user_type
FROM profiles p
WHERE p.id IN (
  '9355093a-8fe4-4c3d-bf0b-72d86a67991b',
  'a83f4584-8d96-4dc9-b81f-00aa816ddb24'
);

-- Create/Update profiles for these specific users
INSERT INTO profiles (id, full_name, email, phone, user_type, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Client') as full_name,
  au.email,
  au.raw_user_meta_data ->> 'phone' as phone,
  COALESCE(au.raw_user_meta_data ->> 'user_type', 'client') as user_type,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.id IN (
  '9355093a-8fe4-4c3d-bf0b-72d86a67991b',
  'a83f4584-8d96-4dc9-b81f-00aa816ddb24'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(EXCLUDED.full_name, 'Client'),
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  user_type = EXCLUDED.user_type,
  updated_at = NOW();

-- Verify the fix
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.user_type
FROM profiles p
WHERE p.id IN (
  '9355093a-8fe4-4c3d-bf0b-72d86a67991b',
  'a83f4584-8d96-4dc9-b81f-00aa816ddb24'
); 