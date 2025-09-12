-- Fix RLS policies for portfolio_images table to resolve insertion issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view portfolio images for public profiles" ON public.portfolio_images;
DROP POLICY IF EXISTS "Users can manage their own portfolio images" ON public.portfolio_images;

-- Create more permissive RLS policies for portfolio_images
CREATE POLICY "Users can view portfolio images" 
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

CREATE POLICY "Users can insert their own portfolio images" 
  ON public.portfolio_images 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own portfolio images" 
  ON public.portfolio_images 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own portfolio images" 
  ON public.portfolio_images 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      WHERE pi.id = portfolio_images.portfolio_item_id 
      AND pi.user_id = auth.uid()
    )
  );