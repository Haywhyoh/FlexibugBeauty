
-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN facebook_handle TEXT,
ADD COLUMN tiktok_handle TEXT,
ADD COLUMN business_slug TEXT;

-- Create unique index for business_slug
CREATE UNIQUE INDEX idx_profiles_business_slug ON public.profiles(business_slug) 
WHERE business_slug IS NOT NULL;

-- Migrate existing full_name data to first_name and last_name
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
    THEN split_part(full_name, ' ', 1)
    ELSE full_name
  END,
  last_name = CASE 
    WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE NULL
  END
WHERE full_name IS NOT NULL;

-- Function to generate business slug from business name
CREATE OR REPLACE FUNCTION generate_business_slug(business_name_input TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base slug: lowercase, replace spaces/special chars with hyphens, remove extra hyphens
  base_slug := lower(trim(regexp_replace(business_name_input, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'business';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE business_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate business_slug when business_name is updated
CREATE OR REPLACE FUNCTION auto_generate_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if business_name is provided and slug is not manually set
  IF NEW.business_name IS NOT NULL AND NEW.business_name != '' THEN
    -- If business_slug is not provided or business_name changed, generate new slug
    IF NEW.business_slug IS NULL OR OLD.business_name IS DISTINCT FROM NEW.business_name THEN
      NEW.business_slug := generate_business_slug(NEW.business_name);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_business_slug
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_business_slug();

-- Update existing profiles with business names to have slugs
UPDATE public.profiles 
SET business_slug = generate_business_slug(business_name)
WHERE business_name IS NOT NULL AND business_name != '' AND business_slug IS NULL;
