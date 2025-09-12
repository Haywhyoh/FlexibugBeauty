-- Proper RLS policies for portfolio_images that will work correctly

-- First, enable RLS if disabled
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view portfolio images" ON public.portfolio_images;
DROP POLICY IF EXISTS "Users can manage portfolio images for their items" ON public.portfolio_images;
DROP POLICY IF EXISTS "Public can view portfolio images for public profiles" ON public.portfolio_images;

-- Policy for viewing portfolio images (public profiles or own images)
CREATE POLICY "portfolio_images_select_policy" 
  ON public.portfolio_images 
  FOR SELECT 
  USING (
    -- Allow if the portfolio item belongs to a public profile OR the user owns it
    EXISTS (
      SELECT 1 
      FROM public.portfolio_items pi
      LEFT JOIN public.profiles p ON pi.user_id = p.id
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND (
        p.is_profile_public = true 
        OR pi.user_id = auth.uid()
        OR auth.uid() IS NULL  -- Allow unauthenticated access to public profiles
      )
    )
  );

-- Policy for inserting portfolio images (only for authenticated users who own the portfolio item)
CREATE POLICY "portfolio_images_insert_policy" 
  ON public.portfolio_images 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  );

-- Policy for updating portfolio images (only for authenticated users who own the portfolio item)
CREATE POLICY "portfolio_images_update_policy" 
  ON public.portfolio_images 
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  );

-- Policy for deleting portfolio images (only for authenticated users who own the portfolio item)
CREATE POLICY "portfolio_images_delete_policy" 
  ON public.portfolio_images 
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  );