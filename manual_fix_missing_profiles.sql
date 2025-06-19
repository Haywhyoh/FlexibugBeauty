-- MANUAL FIX: Run this in Supabase SQL Editor to create missing profile records
-- This will create profile records for users who have client_profiles but no profiles record

-- First, let's see what's missing
SELECT 
  cp.user_id,
  au.email,
  au.raw_user_meta_data ->> 'full_name' as full_name_from_metadata,
  au.raw_user_meta_data ->> 'phone' as phone_from_metadata,
  au.raw_user_meta_data ->> 'user_type' as user_type
FROM client_profiles cp
JOIN auth.users au ON au.id = cp.user_id
LEFT JOIN profiles p ON p.id = cp.user_id
WHERE p.id IS NULL;

-- Now create the missing profiles
INSERT INTO profiles (id, full_name, email, phone, user_type, created_at, updated_at)
SELECT 
  cp.user_id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Client') as full_name,
  au.email,
  au.raw_user_meta_data ->> 'phone' as phone,
  COALESCE(au.raw_user_meta_data ->> 'user_type', 'client') as user_type,
  au.created_at,
  NOW() as updated_at
FROM client_profiles cp
JOIN auth.users au ON au.id = cp.user_id
LEFT JOIN profiles p ON p.id = cp.user_id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  email = COALESCE(EXCLUDED.email, profiles.email),
  phone = COALESCE(EXCLUDED.phone, profiles.phone),
  updated_at = NOW();

-- Verify the fix
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.user_type
FROM client_profiles cp
JOIN profiles p ON p.id = cp.user_id
WHERE cp.professional_id = 'ce217823-1c6a-41e8-8136-93be73980397'; -- Replace with your professional ID 