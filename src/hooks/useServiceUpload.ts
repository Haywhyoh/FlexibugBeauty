import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useServiceUpload = (onUploadComplete: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadServiceImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading service image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteServiceImage = async (imageUrl: string) => {
    try {
      if (!imageUrl) return;

      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');

      const { error } = await supabase.storage
        .from('service-images')
        .remove([filePath]);

      if (error) {
        console.error('Storage deletion error:', error);
      }
    } catch (error) {
      console.error('Error deleting service image:', error);
    }
  };

  return { uploadServiceImage, deleteServiceImage };
};