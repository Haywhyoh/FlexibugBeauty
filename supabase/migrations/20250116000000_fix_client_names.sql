-- Fix missing profiles for existing client users who were created without profile records
-- This addresses the issue where client names don't show up in ClientsView

-- Insert missing profile records for client users
INSERT INTO public.profiles (id, full_name, email, user_type, created_at, updated_at)
SELECT 
  au.id,
  au.raw_user_meta_data ->> 'full_name' as full_name,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'user_type', 'client') as user_type,
  au.created_at,
  now() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL 
  AND au.raw_user_meta_data ->> 'user_type' = 'client'
ON CONFLICT (id) DO NOTHING;

-- Also add phone numbers where available in user metadata
UPDATE public.profiles 
SET phone = au.raw_user_meta_data ->> 'phone'
FROM auth.users au
WHERE profiles.id = au.id 
  AND profiles.phone IS NULL 
  AND au.raw_user_meta_data ->> 'phone' IS NOT NULL
  AND au.raw_user_meta_data ->> 'user_type' = 'client';

-- Update the handle_new_user function to ensure it includes phone data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'beauty_professional'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$; 