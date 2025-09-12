
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  specialty_id: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string;
}

export const usePortfolioUpload = (portfolioItems: PortfolioItem[], onUploadComplete: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleMultipleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const files = Array.from(event.target.files);
      setIsUploading(true);
      
      // Initialize progress tracking
      const initialProgress: UploadProgress[] = files.map(file => ({
        fileName: file.name,
        progress: 0,
        status: 'uploading' as const
      }));
      setUploadProgress(initialProgress);

      // Check authentication
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Always create new portfolio item for multiple file uploads
      console.log('Creating portfolio item for user:', user.id);
      const { data: portfolioItem, error: portfolioError } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: user.id,
          title: `New Portfolio Item ${portfolioItems.length + 1}`,
          sort_order: portfolioItems.length,
          image_url: '', // Provide empty string to satisfy NOT NULL constraint, will be updated later
        })
        .select()
        .single();

      if (portfolioError) {
        console.error('Error creating portfolio item:', portfolioError);
        throw portfolioError;
      }
      
      const portfolioItemId = portfolioItem.id;
      console.log('Created portfolio item with ID:', portfolioItemId);

      // Upload all images
      const uploadPromises = files.map(async (file, index) => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${index}.${fileExt}`;
          const filePath = `${user?.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('portfolio-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(filePath);

          // Insert into portfolio_images table
          console.log('Inserting portfolio image:', {
            portfolio_item_id: portfolioItemId,
            image_url: publicUrl,
            sort_order: index,
            is_primary: index === 0,
            alt_text: file.name
          });

          const { data: imageData, error: insertError } = await supabase
            .from('portfolio_images')
            .insert({
              portfolio_item_id: portfolioItemId,
              image_url: publicUrl,
              sort_order: index,
              is_primary: index === 0, // First image is primary
              alt_text: file.name
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting portfolio image:', insertError);
            console.error('Insert error details:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            });
            throw insertError;
          }

          console.log('Successfully inserted portfolio image:', imageData?.id);

          // Update progress
          setUploadProgress(prev => prev.map(p => 
            p.fileName === file.name 
              ? { ...p, progress: 100, status: 'completed' as const }
              : p
          ));

          return { success: true, fileName: file.name, imageUrl: publicUrl };
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          
          // Update progress to show error
          setUploadProgress(prev => prev.map(p => 
            p.fileName === file.name 
              ? { ...p, progress: 0, status: 'error' as const }
              : p
          ));

          return { success: false, fileName: file.name, error };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      // Update portfolio item with primary image URL for backward compatibility
      if (successCount > 0) {
        // Get the primary image URL (first uploaded image)
        const firstSuccessfulResult = results.find(r => r.success);
        if (firstSuccessfulResult && 'imageUrl' in firstSuccessfulResult) {
          await supabase
            .from('portfolio_items')
            .update({ image_url: firstSuccessfulResult.imageUrl })
            .eq('id', portfolioItemId);
        }

        await onUploadComplete();
        
        toast({
          title: "Upload Complete",
          description: `${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          title: "Upload Failed",
          description: "All images failed to upload",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 3000);
      
      // Reset the input value
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Single image upload (for adding to existing portfolio items)
  const handleSingleImageUpload = async (file: File, portfolioItemId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      // Get current image count for sort order
      const { data: existingImages } = await supabase
        .from('portfolio_images')
        .select('sort_order')
        .eq('portfolio_item_id', portfolioItemId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextSortOrder = existingImages?.[0]?.sort_order + 1 || 0;

      // Insert new image
      const { error: insertError } = await supabase
        .from('portfolio_images')
        .insert({
          portfolio_item_id: portfolioItemId,
          image_url: publicUrl,
          sort_order: nextSortOrder,
          is_primary: false, // New images are not primary by default
          alt_text: file.name
        });

      if (insertError) throw insertError;

      await onUploadComplete();
      
      toast({
        title: "Success",
        description: "Image added successfully",
      });

      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      });
      return false;
    }
  };

  return { 
    handleImageUpload: handleMultipleImageUpload, // For backward compatibility
    handleMultipleImageUpload,
    handleSingleImageUpload,
    uploadProgress,
    isUploading
  };
};
