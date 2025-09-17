-- Add missing business fields to profiles table for unified profile management
-- Migration: 20250115000000_add_business_fields_to_profiles

-- Add business-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{
  "monday": {"open": "09:00", "close": "17:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  "thursday": {"open": "09:00", "close": "19:00", "closed": false},
  "friday": {"open": "09:00", "close": "19:00", "closed": false},
  "saturday": {"open": "10:00", "close": "16:00", "closed": false},
  "sunday": {"open": "10:00", "close": "15:00", "closed": true}
}',
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT true;

-- Add comments for the new columns
COMMENT ON COLUMN public.profiles.business_hours IS 'JSON object containing business operating hours for each day of the week';
COMMENT ON COLUMN public.profiles.business_address IS 'Full business address for the professional';
COMMENT ON COLUMN public.profiles.business_description IS 'Business description separate from personal bio';
COMMENT ON COLUMN public.profiles.instagram_handle IS 'Instagram handle for social media presence';
COMMENT ON COLUMN public.profiles.location IS 'General location (city, state) for the professional';
COMMENT ON COLUMN public.profiles.website_url IS 'Professional website URL';
COMMENT ON COLUMN public.profiles.years_experience IS 'Years of professional experience';
COMMENT ON COLUMN public.profiles.is_profile_public IS 'Whether the profile is publicly visible';

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    user_type, 
    email, 
    phone,
    is_profile_public
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'beauty_professional'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE((NEW.raw_user_meta_data ->> 'is_profile_public')::boolean, true)
  );
  RETURN NEW;
END;
$$;
