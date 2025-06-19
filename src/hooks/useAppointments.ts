import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeAppointments } from "./useRealtimeAppointments";
import { useClientProfileCreation } from "./useClientProfileCreation";

export interface Appointment {
  id: string;
  professional_id: string;
  client_id?: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  notes?: string;
  service?: {
    name: string;
    duration_minutes: number;
    price: number;
  };
  client?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useAppointments = (date?: Date) => {
  const [baseAppointments, setBaseAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createClientProfileFromAppointment } = useClientProfileCreation();

  // Use real-time hook to get live updates - only pass user.id to prevent duplicate subscriptions
  const appointments = useRealtimeAppointments(baseAppointments, user?.id);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, date]);

  const loadAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, duration_minutes, price),
          client_profile:profiles!appointments_client_id_fkey(full_name, avatar_url)
        `)
        .eq('professional_id', user?.id)
        .order('start_time');

      // Filter by date if provided
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query
          .gte('start_time', startOfDay.toISOString())
          .lte('start_time', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Properly type the data and handle potential null values
      const typedAppointments: Appointment[] = (data || []).map(appointment => ({
        id: appointment.id,
        professional_id: appointment.professional_id,
        client_id: appointment.client_id || undefined,
        service_id: appointment.service_id,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status as Appointment['status'],
        client_name: appointment.client_name || undefined,
        client_email: appointment.client_email || undefined,
        client_phone: appointment.client_phone || undefined,
        notes: appointment.notes || undefined,
        service: appointment.service ? {
          name: appointment.service.name,
          duration_minutes: appointment.service.duration_minutes,
          price: appointment.service.price
        } : undefined,
        client: appointment.client_profile ? {
          full_name: appointment.client_profile.full_name,
          avatar_url: appointment.client_profile.avatar_url || undefined
        } : undefined
      }));
      
      setBaseAppointments(typedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      console.log(`Updating appointment ${appointmentId} to status: ${status}`);
      
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      // If appointment is being marked as completed, try to create client profile
      if (status === 'completed') {
        console.log('Appointment marked as completed, attempting to create client profile');
        const appointment = appointments.find(apt => apt.id === appointmentId);
        console.log('Found appointment for client profile creation:', appointment);
        
        if (appointment) {
          const success = await createClientProfileFromAppointment(appointment);
          console.log('Client profile creation result:', success);
        } else {
          console.log('No appointment found with the given ID');
        }
      }

      toast({
        title: "Success",
        description: `Appointment ${status}`,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  return {
    appointments,
    loading,
    refetch: loadAppointments,
    updateAppointmentStatus
  };
};
