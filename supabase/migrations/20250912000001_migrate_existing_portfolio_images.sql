-- Migrate existing single images from portfolio_items to portfolio_images table
-- This ensures backward compatibility and moves all existing data to the new structure

-- Insert existing images into portfolio_images table
INSERT INTO public.portfolio_images (portfolio_item_id, image_url, sort_order, is_primary)
SELECT 
  id,
  image_url,
  0, -- First image gets sort_order 0
  true -- Make it primary since it's the only image
FROM public.portfolio_items 
WHERE image_url IS NOT NULL AND image_url != '';

-- Update portfolio_items to remove the image_url column (optional - can be done later)
-- For now, we'll keep it for backward compatibility during transition
-- ALTER TABLE public.portfolio_items DROP COLUMN image_url;