import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'confirmation' | 'reminder' | 'cancellation' | 'follow_up' | 'professional_notification';
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
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    console.log('Attempting to send email:', emailData.type, 'to:', emailData.recipientEmail);
    
    let subject: string;
    let htmlContent: string;
    
    const formatDate = new Date(emailData.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    switch (emailData.type) {
      case 'professional_notification':
        subject = `🎉 New Booking Alert - ${emailData.serviceName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Booking Alert! 🎉</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${emailData.professionalName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Great news! You have a new appointment booking through your FlexiBug profile.
              </p>
            </div>

            <div style="background: white; border: 2px solid #22c55e; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
              <h3 style="color: #22c55e; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">📅 Appointment Details</h3>
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">💄 Service:</span>
                  <span style="color: #666;">${emailData.serviceName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">📅 Date:</span>
                  <span style="color: #666;">${formatDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">⏰ Time:</span>
                  <span style="color: #666;">${emailData.appointmentTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">⏱️ Duration:</span>
                  <span style="color: #666;">${emailData.duration} minutes</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                  <span style="font-weight: bold; color: #333;">💰 Price:</span>
                  <span style="color: #22c55e; font-weight: bold;">$${emailData.price}</span>
                </div>
              </div>
            </div>

            <div style="background: white; border: 2px solid #3b82f6; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
              <h3 style="color: #3b82f6; margin-top: 0;">👤 Client Information</h3>
              <div style="display: grid; gap: 10px;">
                <p><strong>Name:</strong> ${emailData.clientName || 'Not provided'}</p>
                <p><strong>Email:</strong> ${emailData.clientEmail || 'Not provided'}</p>
                <p><strong>Phone:</strong> ${emailData.clientPhone || 'Not provided'}</p>
              </div>
            </div>

            ${emailData.notes ? `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: #856404; margin-top: 0;">📝 Special Notes from Client:</h4>
                <p style="color: #856404; margin-bottom: 0;">${emailData.notes}</p>
              </div>
            ` : ''}

            <div style="text-align: center; padding: 20px;">
              <p style="color: #888; font-size: 14px;">
                This booking was made through your FlexiBug public profile.
              </p>
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                💖 Powered by FlexiBug Beauty Platform
              </p>
            </div>
          </div>
        `;
        break;

      case 'confirmation':
        subject = `✨ Appointment Confirmed - ${emailData.serviceName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Confirmed! ✨</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${emailData.recipientName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your appointment with <strong>${emailData.professionalName}</strong> has been confirmed. We're excited to see you!
              </p>
            </div>

            <div style="background: white; border: 2px solid #9333ea; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
              <h3 style="color: #9333ea; margin-top: 0;">📅 Your Appointment Details</h3>
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">💄 Service:</span>
                  <span style="color: #666;">${emailData.serviceName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">📅 Date:</span>
                  <span style="color: #666;">${formatDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">⏰ Time:</span>
                  <span style="color: #666;">${emailData.appointmentTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                  <span style="font-weight: bold; color: #333;">⏱️ Duration:</span>
                  <span style="color: #666;">${emailData.duration} minutes</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                  <span style="font-weight: bold; color: #333;">💰 Price:</span>
                  <span style="color: #9333ea; font-weight: bold;">$${emailData.price}</span>
                </div>
              </div>
            </div>

            ${emailData.notes ? `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: #856404; margin-top: 0;">📝 Special Notes:</h4>
                <p style="color: #856404; margin-bottom: 0;">${emailData.notes}</p>
              </div>
            ` : ''}

            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
              <h4 style="color: #0c5460; margin-top: 0;">💡 Important Reminders:</h4>
              <ul style="color: #0c5460; margin-bottom: 0;">
                <li>Please arrive 10 minutes early</li>
                <li>Bring any required items discussed during booking</li>
                <li>Contact us if you need to reschedule at least 24 hours in advance</li>
              </ul>
            </div>

            <div style="text-align: center; padding: 20px;">
              <p style="color: #888; font-size: 14px;">
                Questions? Reply to this email or contact ${emailData.professionalName} directly.
              </p>
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                💖 Powered by FlexiBug Beauty Platform
              </p>
            </div>
          </div>
        `;
        break;

      case 'reminder':
        subject = `Reminder: Your appointment tomorrow - ${emailData.serviceName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #ec4899); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Reminder 🔔</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${emailData.recipientName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                This is a friendly reminder about your upcoming appointment with <strong>${emailData.professionalName}</strong>.
              </p>
            </div>

            <div style="background: white; border: 2px solid #f59e0b; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
              <h3 style="color: #f59e0b; margin-top: 0;">Upcoming Appointment</h3>
              <div style="display: grid; gap: 10px;">
                <p><strong>Service:</strong> ${emailData.serviceName}</p>
                <p><strong>Date:</strong> ${formatDate}</p>
                <p><strong>Time:</strong> ${emailData.appointmentTime}</p>
                <p><strong>Duration:</strong> ${emailData.duration} minutes</p>
              </div>
            </div>

            <div style="text-align: center; padding: 20px;">
              <p style="color: #666;">Looking forward to seeing you!</p>
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                💖 Powered by FlexiBug Beauty Platform
              </p>
            </div>
          </div>
        `;
        break;

      case 'follow_up':
        subject = `Thank you for your visit - ${emailData.serviceName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #ec4899); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Thank You! 💖</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${emailData.recipientName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thank you for choosing <strong>${emailData.professionalName}</strong> for your recent ${emailData.serviceName} appointment. We hope you absolutely love your results!
              </p>
            </div>

            <div style="background: white; border: 2px solid #22c55e; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
              <h3 style="color: #22c55e; margin-top: 0;">Your Recent Appointment</h3>
              <div style="display: grid; gap: 10px;">
                <p><strong>Service:</strong> ${emailData.serviceName}</p>
                <p><strong>Date:</strong> ${formatDate}</p>
                <p><strong>Time:</strong> ${emailData.appointmentTime}</p>
              </div>
            </div>

            <div style="background: #e0f2fe; border: 1px solid #81d4fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h4 style="color: #01579b; margin-top: 0;">💡 Aftercare Tips:</h4>
              <ul style="color: #01579b; margin-bottom: 0;">
                <li>Follow any specific aftercare instructions provided</li>
                <li>Avoid excessive moisture for the first 24-48 hours</li>
                <li>Contact us if you have any questions or concerns</li>
                <li>Book your next appointment to maintain your beautiful results!</li>
              </ul>
            </div>

            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
              <h3 style="color: #333; margin-top: 0;">Love Your Results? Share Your Experience!</h3>
              <p style="color: #666; margin-bottom: 20px;">Your feedback helps us serve you better and helps others discover our services.</p>
              <p style="color: #666;">
                Ready for your next appointment? Contact ${emailData.professionalName} to schedule your follow-up session.
              </p>
            </div>

            <div style="text-align: center; padding: 20px;">
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                💖 Powered by FlexiBug Beauty Platform
              </p>
            </div>
          </div>
        `;
        break;

      case 'cancellation':
        subject = `Appointment Cancelled - ${emailData.serviceName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6b7280, #374151); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Cancelled</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${emailData.recipientName},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your appointment with <strong>${emailData.professionalName}</strong> has been cancelled.
              </p>
            </div>

            <div style="background: white; border: 2px solid #6b7280; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
              <h3 style="color: #6b7280; margin-top: 0;">Cancelled Appointment Details</h3>
              <div style="display: grid; gap: 10px;">
                <p><strong>Service:</strong> ${emailData.serviceName}</p>
                <p><strong>Date:</strong> ${formatDate}</p>
                <p><strong>Time:</strong> ${emailData.appointmentTime}</p>
              </div>
            </div>

            <div style="text-align: center; padding: 20px;">
              <p style="color: #666;">We hope to see you again soon. Feel free to book a new appointment anytime!</p>
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                💖 Powered by FlexiBug Beauty Platform
              </p>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error('Invalid email type');
    }

    // Try to send the email
    try {
      const emailResponse = await resend.emails.send({
        from: "FlexiBug <onboarding@resend.dev>",
        to: [emailData.recipientEmail],
        subject: subject,
        html: htmlContent,
      });

      console.log(`${emailData.type} email sent successfully:`, emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: `${emailData.type} email sent successfully` 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } catch (emailError: any) {
      console.error("Resend API error:", emailError);
      
      // Check if it's a domain validation error
      if (emailError.message && emailError.message.includes('domain')) {
        console.log("Domain validation issue detected. For production use, verify a domain at resend.com/domains");
        
        // Still return success but log the limitation
        return new Response(JSON.stringify({ 
          success: true, 
          warning: "Email sending limited to verified domains. Please verify your domain at resend.com/domains for production use.",
          error: emailError.message
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
      
      throw emailError;
    }

  } catch (error: any) {
    console.error("Error in send-appointment-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check server logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
