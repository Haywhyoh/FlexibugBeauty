-- Make image_url nullable in portfolio_items since we now use portfolio_images table
-- The image_url in portfolio_items is now legacy and should be optional

ALTER TABLE public.portfolio_items 
ALTER COLUMN image_url DROP NOT NULL;