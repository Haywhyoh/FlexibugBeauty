
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ClientProfile {
  id: string;
  user_id: string | null;
  professional_id: string;
  original_lead_id?: string;
  client_since: string;
  total_appointments: number;
  total_spent: number;
  last_appointment_date?: string;
  notes?: string;
  preferences: any;
  created_at: string;
  updated_at: string;
  // Display fields for direct access
  display_name?: string;
  display_email?: string;
  display_phone?: string;
  profile?: {
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  // Add fields for manual entries
  manual_name?: string;
  manual_email?: string;
  manual_phone?: string;
}

export const useClientProfiles = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClients = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching client profiles for professional:', user.id);

      // First, get all client profiles for this professional
      const { data: clientProfiles, error: profilesError } = await supabase
        .from('client_profiles')
        .select(`
          id,
          user_id,
          professional_id,
          client_since,
          total_appointments,
          total_spent,
          notes,
          created_at
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching client profiles:', profilesError);
        throw profilesError;
      }

      console.log('Client profiles found:', clientProfiles?.length || 0);

      if (!clientProfiles || clientProfiles.length === 0) {
        setClients([]);
        return;
      }

      // Get user IDs from client profiles
      const userIds = clientProfiles.map(profile => profile.user_id);

      // Fetch corresponding profile data
      const { data: profiles, error: userProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', userIds);

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError);
        // Continue with client profiles even if we can't get user data
      }

      // Combine the data
      const combinedClients = clientProfiles.map(clientProfile => {
        const userProfile = profiles?.find(p => p.id === clientProfile.user_id);
        
        const displayName = userProfile?.full_name || 'Unknown Client';
        const displayEmail = userProfile?.email || 'No email';
        const displayPhone = userProfile?.phone || null;

        const result = {
          ...clientProfile,
          // New display fields for direct access
          display_name: displayName,
          display_email: displayEmail,
          display_phone: displayPhone,
          // Legacy profile structure for backward compatibility
          profile: {
            full_name: displayName,
            email: displayEmail,
            phone: displayPhone,
            avatar_url: null // Set to null instead of accessing non-existent property
          }
        } as ClientProfile;

        return result;
      });

      console.log('Combined client data:', combinedClients);
      setClients(combinedClients);

    } catch (error: any) {
      console.error('Error in fetchClients:', error);
      setError(error.message || 'Failed to fetch clients');
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateClientNotes = async (clientId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('client_profiles')
        .update({ notes })
        .eq('id', clientId);

      if (error) throw error;

      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId ? { ...client, notes } : client
      ));

      toast({
        title: "Success",
        description: "Client notes updated successfully",
      });

    } catch (error: any) {
      console.error('Error updating client notes:', error);
      toast({
        title: "Error",
        description: "Failed to update client notes",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user?.id]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    refetchClients: fetchClients,
    updateClientNotes
  };
};
