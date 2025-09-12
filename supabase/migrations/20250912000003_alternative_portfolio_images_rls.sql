-- Alternative approach: Create a more permissive policy for portfolio_images insertion

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can insert their own portfolio images" ON public.portfolio_images;
DROP POLICY IF EXISTS "Users can update their own portfolio images" ON public.portfolio_images;
DROP POLICY IF EXISTS "Users can delete their own portfolio images" ON public.portfolio_images;

-- More permissive policies that allow operations when user owns the parent portfolio item
CREATE POLICY "Users can manage portfolio images for their items" 
  ON public.portfolio_images 
  FOR ALL
  USING (
    portfolio_item_id IN (
      SELECT id FROM public.portfolio_items 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    portfolio_item_id IN (
      SELECT id FROM public.portfolio_items 
      WHERE user_id = auth.uid()
    )
  );

-- Ensure public viewing still works
CREATE POLICY "Public can view portfolio images for public profiles" 
  ON public.portfolio_images 
  FOR SELECT 
  USING (
    portfolio_item_id IN (
      SELECT pi.id 
      FROM public.portfolio_items pi
      JOIN public.profiles p ON pi.user_id = p.id
      WHERE p.is_profile_public = true
    )
  );