
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Lead {
  id: string;
  data: any;
  score: string;
  status: string;
  created_at: string;
  form?: {
    title: string;
  };
  form_id?: string;
  notes?: string;
  display_name?: string;
  display_email?: string;
  display_phone?: string;
}

export const useLeadsData = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const extractFieldValue = (data: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
      if (data[key]) {
        return data[key];
      }
    }
    return null;
  };

  const processLeadData = (lead: any): Lead => {
    const data = lead.data || {};
    
    // Common field patterns for names
    const nameKeys = ['name', 'full_name', 'firstName', 'first_name', 'client_name'];
    const emailKeys = ['email', 'email_address', 'contact_email'];
    const phoneKeys = ['phone', 'phone_number', 'contact_phone', 'mobile'];

    // Extract values from data object
    let name = extractFieldValue(data, nameKeys);
    let email = extractFieldValue(data, emailKeys);
    let phone = extractFieldValue(data, phoneKeys);

    // If no direct matches, look through all fields for email pattern
    if (!email) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value.includes('@')) {
          email = value;
          break;
        }
      }
    }

    // If no direct matches for name, look for any field containing a name-like value
    if (!name) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value.length > 1 && !value.includes('@') && 
            !key.toLowerCase().includes('service') && !key.toLowerCase().includes('message')) {
          // Basic heuristic: if it looks like a name (contains space or is capitalized)
          if (value.includes(' ') || (value.charAt(0) === value.charAt(0).toUpperCase() && value.length > 2)) {
            name = value;
            break;
          }
        }
      }
    }

    return {
      ...lead,
      display_name: name || 'Unknown Lead',
      display_email: email || 'No email provided',
      display_phone: phone || null
    };
  };

  const fetchLeads = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          id,
          data,
          score,
          status,
          created_at,
          notes,
          form_id,
          form:form_id (
            title
          )
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (leadsError) {
        throw leadsError;
      }

      const processedLeads = leadsData?.map(processLeadData) || [];
      setLeads(processedLeads);

    } catch (error: any) {
      console.error('Error fetching leads:', error);
      setError(error.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      ));

    } catch (error: any) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  };

  const updateLead = async (leadId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));

    } catch (error: any) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const exportLeads = async () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Status', 'Score', 'Created At'],
        ...leads.map(lead => [
          lead.display_name,
          lead.display_email,
          lead.display_phone || '',
          lead.status,
          lead.score,
          new Date(lead.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user?.id]);

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    refetchLeads: fetchLeads,
    updateLeadStatus,
    updateLead,
    exportLeads
  };
};
