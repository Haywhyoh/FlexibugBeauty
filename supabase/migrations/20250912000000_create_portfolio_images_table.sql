-- Create portfolio_images table for multi-image portfolio support
CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_item_id uuid NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean DEFAULT false,
  alt_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS portfolio_images_portfolio_item_id_idx ON public.portfolio_images(portfolio_item_id);
CREATE INDEX IF NOT EXISTS portfolio_images_sort_order_idx ON public.portfolio_images(portfolio_item_id, sort_order);
CREATE INDEX IF NOT EXISTS portfolio_images_is_primary_idx ON public.portfolio_images(portfolio_item_id, is_primary);

-- Enable RLS on portfolio_images
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_images
CREATE POLICY "Users can view portfolio images for public profiles" 
  ON public.portfolio_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      JOIN public.profiles p ON pi.user_id = p.id
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND (p.is_profile_public = true OR p.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own portfolio images" 
  ON public.portfolio_images 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  );

-- Function to ensure only one primary image per portfolio item
CREATE OR REPLACE FUNCTION public.ensure_single_primary_image()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If setting this image as primary, remove primary status from other images in the same portfolio item
  IF NEW.is_primary = true THEN
    UPDATE public.portfolio_images 
    SET is_primary = false, updated_at = now()
    WHERE portfolio_item_id = NEW.portfolio_item_id 
    AND id != NEW.id
    AND is_primary = true;
  END IF;
  
  -- If no primary image exists and this is the first image, make it primary
  IF NEW.is_primary IS NULL OR NEW.is_primary = false THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.portfolio_images 
      WHERE portfolio_item_id = NEW.portfolio_item_id 
      AND is_primary = true
    ) THEN
      NEW.is_primary = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for primary image management
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_image ON public.portfolio_images;
CREATE TRIGGER trigger_ensure_single_primary_image
  BEFORE INSERT OR UPDATE ON public.portfolio_images
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_primary_image();

-- Function to update portfolio item timestamps when images change
CREATE OR REPLACE FUNCTION public.update_portfolio_item_on_image_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the parent portfolio item's updated_at timestamp
  UPDATE public.portfolio_items 
  SET updated_at = now()
  WHERE id = COALESCE(NEW.portfolio_item_id, OLD.portfolio_item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for portfolio item updates
DROP TRIGGER IF EXISTS trigger_update_portfolio_item_on_image_change ON public.portfolio_images;
CREATE TRIGGER trigger_update_portfolio_item_on_image_change
  AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_images
  FOR EACH ROW EXECUTE FUNCTION public.update_portfolio_item_on_image_change();