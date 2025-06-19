
import { useLeadsData } from './useLeadsData';
import { useLeadFormsData } from './useLeadFormsData';

export const useLeadForms = () => {
  const {
    leads,
    loading: leadsLoading,
    updateLead,
    exportLeads,
    refetchLeads
  } = useLeadsData();

  const {
    leadForms,
    loading: formsLoading,
    createLeadForm,
    updateLeadForm,
    refetchForms
  } = useLeadFormsData();

  return {
    // Lead forms data
    leadForms,
    createLeadForm,
    updateLeadForm,
    refetchForms,
    
    // Leads data
    leads,
    updateLead,
    exportLeads,
    refetchLeads,
    
    // Combined loading state
    loading: leadsLoading || formsLoading
  };
};
