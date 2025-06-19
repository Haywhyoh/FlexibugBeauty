
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailNotificationData {
  type: 'confirmation' | 'reminder' | 'cancellation' | 'follow_up';
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  professionalName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  price: number;
  notes?: string;
}

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendAppointmentEmail = async (emailData: EmailNotificationData) => {
    try {
      console.log('Sending appointment email:', emailData);
      
      const { data, error } = await supabase.functions.invoke('send-appointment-email', {
        body: emailData
      });

      if (error) {
        throw error;
      }

      console.log('Email sent successfully:', data);
      
      // Show success message only for manual sends, not automatic ones
      if (emailData.type === 'confirmation') {
        toast({
          title: "Email Sent",
          description: "Appointment confirmation email has been sent successfully.",
        });
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      toast({
        title: "Email Error",
        description: `Failed to send ${emailData.type} email: ${error.message}`,
        variant: "destructive",
      });

      return { success: false, error: error.message };
    }
  };

  const sendConfirmationEmail = async (appointment: any, professionalName: string) => {
    const emailData: EmailNotificationData = {
      type: 'confirmation',
      appointmentId: appointment.id,
      recipientEmail: appointment.client_email,
      recipientName: appointment.client_name || appointment.client?.full_name || 'Valued Client',
      professionalName,
      serviceName: appointment.service?.name || 'Beauty Service',
      appointmentDate: appointment.start_time,
      appointmentTime: new Date(appointment.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      duration: appointment.service?.duration_minutes || 60,
      price: appointment.service?.price || 0,
      notes: appointment.notes
    };

    return await sendAppointmentEmail(emailData);
  };

  const sendReminderEmail = async (appointment: any, professionalName: string) => {
    const emailData: EmailNotificationData = {
      type: 'reminder',
      appointmentId: appointment.id,
      recipientEmail: appointment.client_email,
      recipientName: appointment.client_name || appointment.client?.full_name || 'Valued Client',
      professionalName,
      serviceName: appointment.service?.name || 'Beauty Service',
      appointmentDate: appointment.start_time,
      appointmentTime: new Date(appointment.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      duration: appointment.service?.duration_minutes || 60,
      price: appointment.service?.price || 0,
      notes: appointment.notes
    };

    return await sendAppointmentEmail(emailData);
  };

  const sendCancellationEmail = async (appointment: any, professionalName: string) => {
    const emailData: EmailNotificationData = {
      type: 'cancellation',
      appointmentId: appointment.id,
      recipientEmail: appointment.client_email,
      recipientName: appointment.client_name || appointment.client?.full_name || 'Valued Client',
      professionalName,
      serviceName: appointment.service?.name || 'Beauty Service',
      appointmentDate: appointment.start_time,
      appointmentTime: new Date(appointment.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      duration: appointment.service?.duration_minutes || 60,
      price: appointment.service?.price || 0,
      notes: appointment.notes
    };

    return await sendAppointmentEmail(emailData);
  };

  const sendFollowUpEmail = async (appointment: any, professionalName: string) => {
    const emailData: EmailNotificationData = {
      type: 'follow_up',
      appointmentId: appointment.id,
      recipientEmail: appointment.client_email,
      recipientName: appointment.client_name || appointment.client?.full_name || 'Valued Client',
      professionalName,
      serviceName: appointment.service?.name || 'Beauty Service',
      appointmentDate: appointment.start_time,
      appointmentTime: new Date(appointment.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      duration: appointment.service?.duration_minutes || 60,
      price: appointment.service?.price || 0,
      notes: appointment.notes
    };

    return await sendAppointmentEmail(emailData);
  };

  return {
    sendConfirmationEmail,
    sendReminderEmail,
    sendCancellationEmail,
    sendFollowUpEmail
  };
};
