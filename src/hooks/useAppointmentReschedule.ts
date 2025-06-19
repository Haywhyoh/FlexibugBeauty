
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAppointmentReschedule = () => {
  const [isRescheduling, setIsRescheduling] = useState<string | null>(null);
  const { toast } = useToast();

  const rescheduleAppointment = async (
    appointmentId: string, 
    newTime: string, 
    newDate: Date,
    durationMinutes: number = 60
  ) => {
    setIsRescheduling(appointmentId);
    
    try {
      // Parse the new time and create start/end times
      const [timeOnly, period] = newTime.split(' ');
      const [hours, minutes] = timeOnly.split(':').map(Number);
      let hour24 = hours;
      
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      
      const startTime = new Date(newDate);
      startTime.setHours(hour24, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      // Update the appointment in the database
      const { error } = await supabase
        .from('appointments')
        .update({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsRescheduling(null);
    }
  };

  return {
    rescheduleAppointment,
    isRescheduling
  };
};
