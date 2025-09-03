-- Make user_id nullable in client_profiles table to support temporary entries during account creation
ALTER TABLE public.client_profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the foreign key constraint to handle null values properly
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_profiles_user_id_fkey' 
        AND table_name = 'client_profiles'
    ) THEN
        ALTER TABLE public.client_profiles 
        DROP CONSTRAINT client_profiles_user_id_fkey;
    END IF;
END $$;

-- Recreate the foreign key constraint to allow nulls
ALTER TABLE public.client_profiles 
ADD CONSTRAINT client_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix missing profiles for existing client users
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
