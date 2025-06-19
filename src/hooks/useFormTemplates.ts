
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  template_type: 'enquiry' | 'appointment_request';
  fields: any[];
  is_system_template: boolean;
  created_at: string;
}

export const useFormTemplates = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .order('is_system_template', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        template_type: item.template_type as FormTemplate['template_type']
      })) as FormTemplate[];
      
      setTemplates(typedData);
    } catch (error) {
      console.error('Error fetching form templates:', error);
      toast({
        title: "Error",
        description: "Failed to load form templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    refetchTemplates: fetchTemplates
  };
};
