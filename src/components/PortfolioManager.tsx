
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PortfolioHeader } from "./portfolio/PortfolioHeader";
import { PortfolioFilters } from "./portfolio/PortfolioFilters";
import { PortfolioEmptyState } from "./portfolio/PortfolioEmptyState";
import { PortfolioGrid } from "./portfolio/PortfolioGrid";
import { usePortfolioUpload } from "./portfolio/usePortfolioUpload";

interface PortfolioImage {
  id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean | null;
  alt_text: string | null;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  specialty_id: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string;
  portfolio_images?: PortfolioImage[];
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

export const PortfolioManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  useEffect(() => {
    fetchSpecialties();
    fetchPortfolioItems();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name');

      if (error) throw error;
      setSpecialties(data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchPortfolioItems = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select(`
          *,
          specialties(name),
          portfolio_images(
            id,
            image_url,
            sort_order,
            is_primary,
            alt_text
          )
        `)
        .eq('user_id', user?.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Sort images within each portfolio item
      const portfolioWithSortedImages = (data || []).map(item => ({
        ...item,
        portfolio_images: (item.portfolio_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      }));
      
      setPortfolioItems(portfolioWithSortedImages);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    }
  };

  const { handleImageUpload } = usePortfolioUpload(portfolioItems, fetchPortfolioItems);

  const handleUploadClick = () => {
    document.getElementById('portfolio-upload')?.click();
  };

  const handleImageUploadWithLoading = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    await handleImageUpload(event);
    setUploading(false);
  };

  const updatePortfolioItem = async (id: string, updates: Partial<PortfolioItem>) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchPortfolioItems();
      
      toast({
        title: "Success",
        description: "Portfolio item updated",
      });
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const deletePortfolioItem = async (id: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('portfolio-images')
        .remove([filePath]);

      if (storageError) console.error('Storage deletion error:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      await fetchPortfolioItems();
      
      toast({
        title: "Success",
        description: "Portfolio item deleted",
      });
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const filteredItems = selectedSpecialty === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.specialty_id === selectedSpecialty);

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-y-auto">
        <div className="w-full max-w-none px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <PortfolioHeader 
            onUploadClick={handleUploadClick} 
            uploading={uploading}
            portfolioItems={portfolioItems}
          />

          <input
            type="file"
            id="portfolio-upload"
            accept="image/*"
            multiple
            onChange={handleImageUploadWithLoading}
            className="hidden"
            disabled={uploading}
          />

          <PortfolioFilters
            specialties={specialties}
            portfolioItems={portfolioItems}
            selectedSpecialty={selectedSpecialty}
            onSpecialtyChange={setSelectedSpecialty}
          />

          {filteredItems.length === 0 ? (
            <PortfolioEmptyState onUploadClick={handleUploadClick} uploading={uploading} />
          ) : (
            <PortfolioGrid
              items={filteredItems}
              specialties={specialties}
              onUpdate={updatePortfolioItem}
              onDelete={deletePortfolioItem}
            />
          )}
        </div>
      </div>
    </div>
  );
};
