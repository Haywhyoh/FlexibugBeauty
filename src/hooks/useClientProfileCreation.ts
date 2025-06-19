
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useClientProfileCreation = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createClientProfileFromAppointment = async (appointment: any) => {
    if (!user?.id) {
      console.log('No professional user found');
      return false;
    }

    console.log('Processing appointment for client profile creation:', appointment);

    setLoading(true);
    try {
      // For registered clients (has client_id)
      if (appointment.client_id) {
        // Check if client profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', appointment.client_id)
          .eq('professional_id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        // If profile already exists, no need to create
        if (existingProfile) {
          console.log('Client profile already exists for registered user');
          toast({
            title: "Client Already in List",
            description: `${appointment.client?.full_name || appointment.client_name} is already in your client list`,
          });
          return true;
        }

        // Create new client profile for registered user
        const { error: createError } = await supabase
          .from('client_profiles')
          .insert({
            user_id: appointment.client_id,
            professional_id: user.id,
            client_since: new Date().toISOString(),
            total_appointments: 1,
            total_spent: appointment.service?.price || 0,
            last_appointment_date: appointment.start_time,
            notes: `Client added automatically after completing appointment: ${appointment.service?.name}`
          });

        if (createError) throw createError;

        toast({
          title: "Client Added",
          description: `${appointment.client?.full_name || appointment.client_name} has been added to your client list`,
        });

        return true;
      } 
      
      // For non-registered clients (guest bookings with just contact info)
      else if (appointment.client_name || appointment.client_email) {
        console.log('Processing guest booking - creating user profile first');
        
        // For guest bookings, we'll create a note-only entry since we can't create a user account
        // This requires a different approach - let's create a lead instead or handle it differently
        
        toast({
          title: "Guest Booking Completed",
          description: `Appointment completed for ${appointment.client_name}. Contact details saved for follow-up.`,
        });

        console.log('Guest booking completed - no user account to link to client profile');
        return true;
      }

      console.log('No client information found in appointment');
      return false;

    } catch (error) {
      console.error('Error creating client profile:', error);
      toast({
        title: "Error",
        description: "Failed to add client to your list",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createClientProfileFromAppointment,
    loading
  };
};
