
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePortfolioUpload = (portfolioItems: any[], onUploadComplete: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
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

      // Create portfolio item
      const { error: insertError } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: user?.id,
          title: `New Portfolio Item ${portfolioItems.length + 1}`,
          image_url: publicUrl,
          sort_order: portfolioItems.length,
        });

      if (insertError) throw insertError;

      await onUploadComplete();
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      // Reset the input value so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return { handleImageUpload };
};
