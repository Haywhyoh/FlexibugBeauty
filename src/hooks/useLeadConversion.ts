
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLeadConversion = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendInvitation = async (leadId: string, leadData: any) => {
    if (!user?.id) return null;

    setLoading(true);
    try {
      console.log('Sending invitation for lead:', leadId);
      console.log('Lead data:', leadData);

      const { data, error } = await supabase.functions.invoke('send-lead-invitation', {
        body: {
          leadId,
          leadData,
          customMessage: leadData.customMessage
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Invitation sent successfully:', data);

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${leadData.display_email || leadData.email || 'the lead'}`,
      });

      return data.invitationToken;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      
      let errorMessage = "Failed to send invitation";
      
      // Handle specific error cases
      if (error.message?.includes('Email service not configured')) {
        errorMessage = "Email service not configured. Please contact support.";
      } else if (error.message?.includes('No email address found')) {
        errorMessage = "No email address found for this lead";
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const convertLeadToClient = async (leadId: string, userId: string) => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      // Get lead data
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      // Create client profile
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          user_id: userId,
          professional_id: user.id,
          original_lead_id: leadId
        });

      if (profileError) throw profileError;

      // Update lead with conversion details
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          converted_to_user_id: userId,
          conversion_date: new Date().toISOString(),
          status: 'converted'
        })
        .eq('id', leadId);

      if (updateError) throw updateError;

      toast({
        title: "Lead Converted",
        description: "Lead successfully converted to client",
      });

      return true;
    } catch (error) {
      console.error('Error converting lead:', error);
      toast({
        title: "Error",
        description: "Failed to convert lead to client",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendInvitation,
    convertLeadToClient,
    loading
  };
};
