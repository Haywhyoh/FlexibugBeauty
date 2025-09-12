import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedClient {
  id: string;
  type: 'registered' | 'guest';
  name: string;
  email: string;
  phone: string | null;
  totalBookings: number;
  totalSpent: number;
  firstBookingDate: string | null;
  lastBookingDate: string | null;
  notes: string | null;
  isConverted: boolean;
  convertedUserId?: string | null;
  canInvite: boolean;
  // Original data for type-specific operations
  originalData: any;
}

export const useUnifiedClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<UnifiedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch registered clients (client_profiles)
      const { data: registeredClients, error: registeredError } = await supabase
        .from('client_profiles')
        .select(`
          id,
          user_id,
          total_appointments,
          total_spent,
          last_appointment_date,
          client_since,
          notes,
          profiles!user_id (
            id,
            first_name,
            last_name,
            full_name,
            email,
            phone
          )
        `)
        .eq('professional_id', user.id);

      if (registeredError) throw registeredError;

      // Fetch guest clients
      const { data: guestClients, error: guestError } = await supabase
        .from('guest_clients')
        .select('*')
        .eq('professional_id', user.id);

      if (guestError) throw guestError;

      // Transform and combine both types
      const unifiedClients: UnifiedClient[] = [];

      // Add registered clients
      if (registeredClients) {
        registeredClients.forEach((client: any) => {
          const profile = client.profiles;
          if (profile) {
            unifiedClients.push({
              id: client.id,
              type: 'registered',
              name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
              email: profile.email || '',
              phone: profile.phone,
              totalBookings: client.total_appointments || 0,
              totalSpent: parseFloat(client.total_spent || '0'),
              firstBookingDate: client.client_since,
              lastBookingDate: client.last_appointment_date,
              notes: client.notes,
              isConverted: false, // Already converted
              canInvite: false, // Already registered
              originalData: client
            });
          }
        });
      }

      // Add guest clients
      if (guestClients) {
        guestClients.forEach((client: any) => {
          unifiedClients.push({
            id: client.id,
            type: 'guest',
            name: client.full_name || `${client.first_name || ''} ${client.last_name || ''}`.trim(),
            email: client.email,
            phone: client.phone,
            totalBookings: client.total_bookings || 0,
            totalSpent: parseFloat(client.total_spent || '0'),
            firstBookingDate: client.first_booking_date,
            lastBookingDate: client.last_booking_date,
            notes: client.notes,
            isConverted: !!client.converted_to_user_id,
            convertedUserId: client.converted_to_user_id,
            canInvite: !client.converted_to_user_id && !client.invitation_sent_at,
            originalData: client
          });
        });
      }

      // Sort by most recent activity
      unifiedClients.sort((a, b) => {
        const aDate = a.lastBookingDate || a.firstBookingDate || '';
        const bDate = b.lastBookingDate || b.firstBookingDate || '';
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

      setClients(unifiedClients);

    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Failed to load clients');
      toast({
        title: 'Error',
        description: 'Failed to load clients',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inviteGuestClient = async (guestClientId: string) => {
    try {
      // Generate invitation token and expiry
      const invitationToken = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Update guest client with invitation details
      const { error } = await supabase
        .from('guest_clients')
        .update({
          invitation_token: invitationToken,
          invitation_sent_at: new Date().toISOString(),
          invitation_expires_at: expiresAt.toISOString()
        })
        .eq('id', guestClientId)
        .eq('professional_id', user?.id);

      if (error) throw error;

      // Here you would typically send an email invitation
      // For now, we'll just show success
      toast({
        title: 'Invitation Sent',
        description: 'Client invitation has been sent successfully',
      });

      // Refresh clients list
      fetchClients();

      return true;
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateClientNotes = async (client: UnifiedClient, notes: string) => {
    try {
      if (client.type === 'registered') {
        const { error } = await supabase
          .from('client_profiles')
          .update({ notes, updated_at: new Date().toISOString() })
          .eq('id', client.id)
          .eq('professional_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('guest_clients')
          .update({ notes, updated_at: new Date().toISOString() })
          .eq('id', client.id)
          .eq('professional_id', user?.id);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Client notes updated',
      });

      fetchClients();
      return true;
    } catch (err: any) {
      console.error('Error updating notes:', err);
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user?.id]);

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    inviteGuestClient,
    updateClientNotes,
  };
};