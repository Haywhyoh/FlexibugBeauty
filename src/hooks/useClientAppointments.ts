
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "./useAppointments";

export const useClientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadClientAppointments();
    }
  }, [user]);

  const loadClientAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, duration_minutes, price),
          professional:profiles!professional_id(full_name, business_name, avatar_url)
        `)
        .or(`client_id.eq.${user?.id},client_email.eq.${user?.email}`)
        .order('start_time', { ascending: false });

      if (error) throw error;

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
        professional: appointment.professional ? {
          full_name: appointment.professional.full_name,
          business_name: appointment.professional.business_name,
          avatar_url: appointment.professional.avatar_url || undefined
        } : undefined
      }));

      setAppointments(typedAppointments);
    } catch (error) {
      console.error('Error loading client appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load your appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  return {
    appointments,
    loading,
    refetch: loadClientAppointments,
    cancelAppointment
  };
};
