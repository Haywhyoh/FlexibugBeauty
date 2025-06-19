-- Create a function to create missing client profiles by accessing auth.users
CREATE OR REPLACE FUNCTION create_missing_client_profiles(p_user_ids UUID[])
RETURNS TABLE(created_count INTEGER, created_profiles JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  created_count INTEGER := 0;
  profiles_created JSONB := '[]'::JSONB;
  profile_data JSONB;
BEGIN
  -- Loop through each user ID
  FOR user_record IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data,
      au.created_at
    FROM auth.users au
    WHERE au.id = ANY(p_user_ids)
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = au.id
      )
  LOOP
    -- Create profile record
    INSERT INTO public.profiles (
      id, 
      full_name, 
      email, 
      phone, 
      user_type, 
      created_at, 
      updated_at
    ) VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data ->> 'full_name', 'Client'),
      user_record.email,
      user_record.raw_user_meta_data ->> 'phone',
      COALESCE(user_record.raw_user_meta_data ->> 'user_type', 'client'),
      user_record.created_at,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      email = COALESCE(EXCLUDED.email, profiles.email),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      updated_at = NOW();
    
    -- Build the profile data for return
    profile_data := jsonb_build_object(
      'id', user_record.id,
      'full_name', COALESCE(user_record.raw_user_meta_data ->> 'full_name', 'Client'),
      'email', user_record.email,
      'phone', user_record.raw_user_meta_data ->> 'phone',
      'user_type', COALESCE(user_record.raw_user_meta_data ->> 'user_type', 'client')
    );
    
    -- Add to the profiles_created array
    profiles_created := profiles_created || profile_data;
    created_count := created_count + 1;
  END LOOP;
  
  RETURN QUERY SELECT created_count, profiles_created;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_missing_client_profiles(UUID[]) TO authenticated; 