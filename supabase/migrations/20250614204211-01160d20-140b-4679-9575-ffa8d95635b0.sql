
-- Fix the trigger to only generate slug when business_name actually changes
-- and preserve existing slugs
CREATE OR REPLACE FUNCTION auto_generate_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if business_name is provided and slug is not manually set
  IF NEW.business_name IS NOT NULL AND NEW.business_name != '' THEN
    -- If this is an INSERT and no slug is provided, generate one
    IF TG_OP = 'INSERT' AND NEW.business_slug IS NULL THEN
      NEW.business_slug := generate_business_slug(NEW.business_name);
    -- If this is an UPDATE and business_name changed, generate new slug
    ELSIF TG_OP = 'UPDATE' AND OLD.business_name IS DISTINCT FROM NEW.business_name THEN
      NEW.business_slug := generate_business_slug(NEW.business_name);
    -- If this is an UPDATE but business_name didn't change, keep existing slug
    ELSIF TG_OP = 'UPDATE' AND OLD.business_name = NEW.business_name THEN
      NEW.business_slug := OLD.business_slug;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
