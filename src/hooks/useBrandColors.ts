import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BrandColors, defaultBrandColors, applyBrandColors, getBrandInlineStyles } from '@/lib/brandColors';

/**
 * Hook for managing brand colors across the application
 * Provides functions to load, save, and apply brand colors
 */
export const useBrandColors = () => {
  const [brandColors, setBrandColors] = useState<BrandColors>(defaultBrandColors);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Load brand colors from database
  useEffect(() => {
    const loadBrandColors = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('brand_colors')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading brand colors:', error);
        } else if (data?.brand_colors) {
          setBrandColors(data.brand_colors as BrandColors);
        }
      } catch (error) {
        console.error('Error loading brand colors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrandColors();
  }, [user?.id]);

  // Save brand colors to database
  const saveBrandColors = async (colors: BrandColors) => {
    if (!user?.id) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ brand_colors: colors })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setBrandColors(colors);
      return true;
    } catch (error) {
      console.error('Error saving brand colors:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Apply brand colors to a DOM element
  const applyColors = (element: HTMLElement) => {
    applyBrandColors(element, brandColors);
  };

  // Get inline styles for React components
  const getStyles = () => {
    return getBrandInlineStyles(brandColors);
  };

  // Update colors locally (without saving)
  const updateColors = (colors: Partial<BrandColors>) => {
    setBrandColors(prev => ({ ...prev, ...colors }));
  };

  return {
    brandColors,
    loading,
    saving,
    saveBrandColors,
    applyColors,
    getStyles,
    updateColors,
    setBrandColors
  };
};
