
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PortfolioHeader } from "./portfolio/PortfolioHeader";
import { PortfolioFilters } from "./portfolio/PortfolioFilters";
import { PortfolioEmptyState } from "./portfolio/PortfolioEmptyState";
import { PortfolioGrid } from "./portfolio/PortfolioGrid";
import { PortfolioCreationModal } from "./portfolio/PortfolioCreationModal";
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
  const [showCreationModal, setShowCreationModal] = useState(false);

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
    setShowCreationModal(true);
  };

  const handleImageUploadWithLoading = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    await handleImageUpload(event);
    setUploading(false);
  };

  const handleCreatePortfolio = async (data: {
    title: string;
    description: string;
    specialtyId: string;
    images: File[];
    primaryImageIndex: number;
  }) => {
    try {
      setUploading(true);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create portfolio item with proper form data
      const { data: portfolioItem, error: portfolioError } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          specialty_id: data.specialtyId || null,
          sort_order: portfolioItems.length,
          image_url: '', // Will be updated after uploading images
        })
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      const portfolioItemId = portfolioItem.id;
      let primaryImageUrl = '';

      // Upload all images
      const uploadPromises = data.images.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${index}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(filePath);

        // Store primary image URL
        if (index === data.primaryImageIndex) {
          primaryImageUrl = publicUrl;
        }

        // Insert into portfolio_images table
        const { error: insertError } = await supabase
          .from('portfolio_images')
          .insert({
            portfolio_item_id: portfolioItemId,
            image_url: publicUrl,
            sort_order: index,
            is_primary: index === data.primaryImageIndex,
            alt_text: file.name
          });

        if (insertError) throw insertError;

        return publicUrl;
      });

      await Promise.all(uploadPromises);

      // Update portfolio item with primary image URL
      if (primaryImageUrl) {
        await supabase
          .from('portfolio_items')
          .update({ image_url: primaryImageUrl })
          .eq('id', portfolioItemId);
      }

      await fetchPortfolioItems();
      setShowCreationModal(false);

      toast({
        title: "Success",
        description: `Portfolio "${data.title}" created with ${data.images.length} images`,
      });

    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
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

      {/* Portfolio Creation Modal */}
      <PortfolioCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onSubmit={handleCreatePortfolio}
        specialties={specialties}
        isSubmitting={uploading}
      />
    </div>
  );
};
