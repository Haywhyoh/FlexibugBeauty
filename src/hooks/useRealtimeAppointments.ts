
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "./useAppointments";

export const useRealtimeAppointments = (initialAppointments: Appointment[], professionalId?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // Update local state when initial appointments change
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  useEffect(() => {
    if (!user) return;

    const targetProfessionalId = professionalId || user.id;
    
    // Clean up existing channel if it exists
    if (channelRef.current) {
      console.log('Cleaning up existing real-time subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // Only set up subscription if we haven't already subscribed for this professional
    if (!isSubscribedRef.current) {
      console.log('Setting up real-time subscription for appointments');
      
      const channelName = `appointments-realtime-${targetProfessionalId}-${Date.now()}`;
      const channel = supabase.channel(channelName);

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments',
            filter: `professional_id=eq.${targetProfessionalId}`
          },
          async (payload) => {
            console.log('New appointment received:', payload);
            
            // Fetch the complete appointment data with relations
            const { data: newAppointment, error } = await supabase
              .from('appointments')
              .select(`
                *,
                service:services(name, duration_minutes, price),
                client_profile:profiles!appointments_client_id_fkey(full_name, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching new appointment details:', error);
              return;
            }

            if (newAppointment) {
              const typedAppointment: Appointment = {
                id: newAppointment.id,
                professional_id: newAppointment.professional_id,
                client_id: newAppointment.client_id || undefined,
                service_id: newAppointment.service_id,
                start_time: newAppointment.start_time,
                end_time: newAppointment.end_time,
                status: newAppointment.status as Appointment['status'],
                client_name: newAppointment.client_name || undefined,
                client_email: newAppointment.client_email || undefined,
                client_phone: newAppointment.client_phone || undefined,
                notes: newAppointment.notes || undefined,
                service: newAppointment.service ? {
                  name: newAppointment.service.name,
                  duration_minutes: newAppointment.service.duration_minutes,
                  price: newAppointment.service.price
                } : undefined,
                client: newAppointment.client_profile ? {
                  full_name: newAppointment.client_profile.full_name,
                  avatar_url: newAppointment.client_profile.avatar_url || undefined
                } : undefined
              };

              setAppointments(prev => [...prev, typedAppointment]);
              
              toast({
                title: "New Appointment Booked! 🎉",
                description: `${typedAppointment.client_name || 'New client'} booked ${typedAppointment.service?.name}`,
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appointments',
            filter: `professional_id=eq.${targetProfessionalId}`
          },
          (payload) => {
            console.log('Appointment updated:', payload);
            
            setAppointments(prev =>
              prev.map(apt =>
                apt.id === payload.new.id
                  ? { ...apt, ...payload.new, status: payload.new.status as Appointment['status'] }
                  : apt
              )
            );
            
            toast({
              title: "Appointment Updated",
              description: "An appointment has been updated",
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'appointments',
            filter: `professional_id=eq.${targetProfessionalId}`
          },
          (payload) => {
            console.log('Appointment deleted:', payload);
            
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
            
            toast({
              title: "Appointment Cancelled",
              description: "An appointment has been cancelled",
            });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          }
        });

      // Store the channel reference
      channelRef.current = channel;
    }

    return () => {
      console.log('Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id, professionalId, toast]);

  return appointments;
};
