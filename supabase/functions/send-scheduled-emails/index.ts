
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled email process...');
    
    // Get current time and tomorrow
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    // Query for appointments that need 24-hour reminders
    const { data: reminderAppointments, error: reminderError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration_minutes, price),
        professional:profiles!appointments_professional_id_fkey(full_name)
      `)
      .eq('status', 'confirmed')
      .gte('start_time', twentyFourHoursFromNow.toISOString())
      .lte('start_time', new Date(twentyFourHoursFromNow.getTime() + 60 * 60 * 1000).toISOString()) // 1-hour window
      .not('reminder_sent_24h', 'eq', true);

    if (reminderError) {
      console.error('Error fetching reminder appointments:', reminderError);
    } else {
      console.log(`Found ${reminderAppointments?.length || 0} appointments for 24h reminders`);
      
      // Send 24-hour reminders
      for (const appointment of reminderAppointments || []) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-appointment-email', {
            body: {
              type: 'reminder',
              appointmentId: appointment.id,
              recipientEmail: appointment.client_email,
              recipientName: appointment.client_name || 'Valued Client',
              professionalName: appointment.professional?.full_name || 'Your Beauty Professional',
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
            }
          });

          if (!emailError) {
            // Mark reminder as sent
            await supabase
              .from('appointments')
              .update({ reminder_sent_24h: true })
              .eq('id', appointment.id);
            
            console.log(`24h reminder sent for appointment ${appointment.id}`);
          } else {
            console.error(`Failed to send 24h reminder for appointment ${appointment.id}:`, emailError);
          }
        } catch (error) {
          console.error(`Error processing 24h reminder for appointment ${appointment.id}:`, error);
        }
      }
    }

    // Query for appointments that need 2-hour reminders
    const { data: urgentReminders, error: urgentError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration_minutes, price),
        professional:profiles!appointments_professional_id_fkey(full_name)
      `)
      .eq('status', 'confirmed')
      .gte('start_time', twoHoursFromNow.toISOString())
      .lte('start_time', new Date(twoHoursFromNow.getTime() + 30 * 60 * 1000).toISOString()) // 30-minute window
      .not('reminder_sent_2h', 'eq', true);

    if (urgentError) {
      console.error('Error fetching urgent reminder appointments:', urgentError);
    } else {
      console.log(`Found ${urgentReminders?.length || 0} appointments for 2h reminders`);
      
      // Send 2-hour reminders
      for (const appointment of urgentReminders || []) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-appointment-email', {
            body: {
              type: 'reminder',
              appointmentId: appointment.id,
              recipientEmail: appointment.client_email,
              recipientName: appointment.client_name || 'Valued Client',
              professionalName: appointment.professional?.full_name || 'Your Beauty Professional',
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
            }
          });

          if (!emailError) {
            // Mark reminder as sent
            await supabase
              .from('appointments')
              .update({ reminder_sent_2h: true })
              .eq('id', appointment.id);
            
            console.log(`2h reminder sent for appointment ${appointment.id}`);
          } else {
            console.error(`Failed to send 2h reminder for appointment ${appointment.id}:`, emailError);
          }
        } catch (error) {
          console.error(`Error processing 2h reminder for appointment ${appointment.id}:`, error);
        }
      }
    }

    // Query for completed appointments that need follow-up emails (24 hours after completion)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { data: followUpAppointments, error: followUpError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration_minutes, price),
        professional:profiles!appointments_professional_id_fkey(full_name)
      `)
      .eq('status', 'completed')
      .gte('end_time', yesterday.toISOString())
      .lte('end_time', new Date(yesterday.getTime() + 60 * 60 * 1000).toISOString()) // 1-hour window
      .not('follow_up_sent', 'eq', true);

    if (followUpError) {
      console.error('Error fetching follow-up appointments:', followUpError);
    } else {
      console.log(`Found ${followUpAppointments?.length || 0} appointments for follow-up emails`);
      
      // Send follow-up emails
      for (const appointment of followUpAppointments || []) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-appointment-email', {
            body: {
              type: 'follow_up',
              appointmentId: appointment.id,
              recipientEmail: appointment.client_email,
              recipientName: appointment.client_name || 'Valued Client',
              professionalName: appointment.professional?.full_name || 'Your Beauty Professional',
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
            }
          });

          if (!emailError) {
            // Mark follow-up as sent
            await supabase
              .from('appointments')
              .update({ follow_up_sent: true })
              .eq('id', appointment.id);
            
            console.log(`Follow-up email sent for appointment ${appointment.id}`);
          } else {
            console.error(`Failed to send follow-up for appointment ${appointment.id}:`, emailError);
          }
        } catch (error) {
          console.error(`Error processing follow-up for appointment ${appointment.id}:`, error);
        }
      }
    }

    const summary = {
      remindersSent: reminderAppointments?.length || 0,
      urgentRemindersSent: urgentReminders?.length || 0,
      followUpsSent: followUpAppointments?.length || 0,
      timestamp: now.toISOString()
    };

    console.log('Email automation completed:', summary);

    return new Response(JSON.stringify({ 
      success: true, 
      summary 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-scheduled-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
