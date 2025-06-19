
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LeadForm {
  id: string;
  professional_id: string;
  title: string;
  description?: string;
  fields: any[];
  branding: any;
  is_active: boolean;
  embed_code?: string;
  created_at: string;
  updated_at: string;
}

export const useLeadFormsData = () => {
  const [leadForms, setLeadForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeadForms = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('lead_forms')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const formsWithTypedFields = (data || []).map(form => ({
        ...form,
        fields: Array.isArray(form.fields) ? form.fields : [],
        branding: typeof form.branding === 'object' ? form.branding : {}
      }));
      
      setLeadForms(formsWithTypedFields);
    } catch (error) {
      console.error('Error fetching lead forms:', error);
      toast({
        title: "Error",
        description: "Failed to load lead forms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLeadForm = async (formData: Partial<LeadForm>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('lead_forms')
        .insert({
          professional_id: user.id,
          title: formData.title || 'Untitled Form',
          description: formData.description,
          fields: formData.fields || [],
          branding: formData.branding || {},
          is_active: formData.is_active ?? true
        })
        .select()
        .single();

      if (error) throw error;
      
      // Generate embed code
      const embedCode = `<iframe src="${window.location.origin}/embed/form/${data.id}" width="100%" height="600" frameborder="0"></iframe>`;
      
      await supabase
        .from('lead_forms')
        .update({ embed_code: embedCode })
        .eq('id', data.id);

      await fetchLeadForms();
      return data;
    } catch (error) {
      console.error('Error creating lead form:', error);
      toast({
        title: "Error",
        description: "Failed to create lead form",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateLeadForm = async (id: string, updates: Partial<LeadForm>) => {
    try {
      const { error } = await supabase
        .from('lead_forms')
        .update({
          title: updates.title,
          description: updates.description,
          fields: updates.fields,
          branding: updates.branding,
          is_active: updates.is_active
        })
        .eq('id', id);

      if (error) throw error;
      await fetchLeadForms();
    } catch (error) {
      console.error('Error updating lead form:', error);
      toast({
        title: "Error",
        description: "Failed to update lead form",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchLeadForms();
  }, [user?.id]);

  return {
    leadForms,
    loading,
    createLeadForm,
    updateLeadForm,
    refetchForms: fetchLeadForms
  };
};
