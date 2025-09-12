
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting lead invitation process...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { leadId, leadData, customMessage } = await req.json()
    console.log('Received data:', { leadId, leadData, customMessage })

    // Get the beauty professional's information
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.id)

    const { data: professional, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching professional profile:', profileError)
      throw new Error('Failed to fetch professional profile')
    }

    console.log('Professional profile:', professional)

    // Enhanced email extraction logic for dynamic field names
    const extractEmail = (data: any) => {
      // First try standard field names
      const standardEmailFields = ['email', 'display_email', 'email_address', 'contact_email']
      for (const field of standardEmailFields) {
        if (data[field]) {
          return data[field]
        }
      }
      
      // Then look through all field values for email patterns
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (emailRegex.test(value)) {
            console.log(`Found email in field ${key}:`, value)
            return value
          }
        }
      }
      
      return null
    }

    // Enhanced name extraction logic
    const extractName = (data: any) => {
      // First try standard field names
      const standardNameFields = ['name', 'display_name', 'full_name', 'firstName', 'first_name', 'client_name']
      for (const field of standardNameFields) {
        if (data[field]) {
          return data[field]
        }
      }
      
      // Then look for name-like values in dynamic fields
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value.length > 1) {
          // Skip email addresses
          if (value.includes('@')) continue
          
          // Skip service-related fields
          if (key.toLowerCase().includes('service') || 
              value.toLowerCase().includes('service') ||
              value.toLowerCase().includes('email') ||
              value.toLowerCase().includes('phone')) continue
          
          // Basic heuristic: if it looks like a name (contains space, is capitalized, or is reasonably short)
          if (value.includes(' ') || 
              (value.charAt(0) === value.charAt(0).toUpperCase() && value.length <= 50 && !value.includes('.'))) {
            console.log(`Found name in field ${key}:`, value)
            return value
          }
        }
      }
      
      return 'there'
    }

    const email = extractEmail(leadData.data || leadData)
    const name = extractName(leadData.data || leadData)

    console.log('Extracted email:', email, 'Extracted name:', name)

    if (!email) {
      console.error('No email found in lead data:', leadData)
      throw new Error('No email address found for this lead')
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID()
    console.log('Generated invitation token')

    // Update lead with invitation details
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({
        invitation_sent_at: new Date().toISOString(),
        invitation_token: invitationToken
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Error updating lead:', updateError)
      throw new Error('Failed to update lead with invitation details')
    }

    console.log('Lead updated with invitation details')

    // Create invitation URL
    const baseUrl = req.headers.get('origin') || 'https://Botglam.com'
    const invitationUrl = `${baseUrl}/signup?invitation=${invitationToken}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`

    console.log('Created invitation URL')

    // Prepare email content
    const professionalName = professional?.full_name || professional?.business_name || 'Your Beauty Professional'
    const emailSubject = `${professionalName} has invited you to join Botglam`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're invited to join Botglam</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            <p style="color: #f3edff; margin: 10px 0 0 0; font-size: 16px;">Join Botglam for seamless beauty appointments</p>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${professionalName} has invited you to create an account on Botglam, making it easier than ever to book and manage your beauty appointments.
            </p>
            
            ${customMessage ? `
              <div style="background: white; padding: 15px; border-left: 4px solid #9333ea; margin: 20px 0;">
                <p style="margin: 0; font-style: italic;">"${customMessage}"</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">- ${professionalName}</p>
              </div>
            ` : ''}
            
            <h3 style="color: #1f2937; margin-top: 25px;">What you'll get:</h3>
            <ul style="padding-left: 20px; margin-bottom: 25px;">
              <li style="margin-bottom: 8px;">🗓️ Easy online booking 24/7</li>
              <li style="margin-bottom: 8px;">📱 Automatic appointment reminders</li>
              <li style="margin-bottom: 8px;">💬 Direct messaging with ${professionalName}</li>
              <li style="margin-bottom: 8px;">📋 View your appointment history</li>
              <li style="margin-bottom: 8px;">⚡ Quick rebooking of your favorite services</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" style="background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Create Your Account
            </a>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #0ea5e9;">
            <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
              <strong>Quick Setup:</strong> Your information is already pre-filled, so creating your account takes less than a minute!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              This invitation was sent by ${professionalName} through Botglam.<br>
              If you have any questions, feel free to reply to this email.
            </p>
          </div>
        </body>
      </html>
    `

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      throw new Error('Email service not configured. Please contact support.')
    }

    console.log('Sending email via Resend...')

    // Send email using Resend - FIX: Use string instead of array for 'to' field
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Botglam <noreply@Botglam.com>',
        to: email, // Changed from [email] to email - Resend expects a string
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    console.log('Resend response status:', emailResponse.status)

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend error response:', errorText)
      throw new Error(`Failed to send email: ${errorText}`)
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationToken,
        emailId: emailResult.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in send-lead-invitation function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
