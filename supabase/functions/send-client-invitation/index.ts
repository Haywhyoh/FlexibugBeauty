import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClientInvitationRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  welcomeMessage?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authenticated user (beauty professional)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { clientName, clientEmail, clientPhone, notes, welcomeMessage } = await req.json() as ClientInvitationRequest

    // Get professional's information
    const { data: professional } = await supabaseClient
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single()

    if (!professional) {
      throw new Error('Professional profile not found')
    }

    // Check if user already exists by trying to list users with this email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users?.find(u => u.email === clientEmail)
    
    if (existingUser) {
      // User already exists, check if they have a client profile with this professional
      const { data: existingProfile } = await supabaseClient
        .from('client_profiles')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('professional_id', user.id)
        .single()

      if (existingProfile) {
        return new Response(
          JSON.stringify({ error: 'Client already exists in your client list' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      }

      // Create client profile for existing user
      const { error: profileError } = await supabaseClient
        .from('client_profiles')
        .insert({
          user_id: existingUser.id,
          professional_id: user.id,
          client_since: new Date().toISOString(),
          total_appointments: 0,
          total_spent: 0,
          notes: notes || `Added by ${professional.full_name || professional.business_name}`
        })

      if (profileError) throw profileError

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Existing user added to your client list',
          isExistingUser: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Generate temporary password
    const tempPassword = 'TempPass123!'

    // Create new user account
    const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: clientEmail,
      password: tempPassword,
      user_metadata: {
        full_name: clientName,
        user_type: 'client'
      },
      email_confirm: true // Auto-confirm email to avoid verification step
    })

    if (userError) throw userError

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if profile was created by trigger, if not create it, otherwise update it
    const { data: existingProfile, error: profileCheckError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', newUser.user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileCheckError);
    }

    if (existingProfile) {
      // Profile exists from trigger, update it with additional info
      const { error: updateProfileError } = await supabaseClient
        .from('profiles')
        .update({
          full_name: clientName,
          email: clientEmail,
          phone: clientPhone,
          updated_at: new Date().toISOString()
        })
        .eq('id', newUser.user.id);

      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError);
      }
    } else {
      // Profile doesn't exist, create it manually
      const { error: newProfileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: newUser.user.id,
          full_name: clientName,
          email: clientEmail,
          phone: clientPhone,
          user_type: 'client'
        });

      if (newProfileError) {
        console.error('Error creating profile:', newProfileError);
      }
    }

    // Create client profile for new user
    const { error: profileError } = await supabaseClient
      .from('client_profiles')
      .insert({
        user_id: newUser.user.id,
        professional_id: user.id,
        client_since: new Date().toISOString(),
        total_appointments: 0,
        total_spent: 0,
        notes: notes || `New client account created by ${professional.full_name || professional.business_name}`
      })

    if (profileError) throw profileError

    // Send welcome email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Client account created successfully (email not sent - RESEND_API_KEY not configured)',
          tempPassword 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const professionalName = professional.full_name || professional.business_name || 'Your Beauty Professional'
    const loginUrl = `${req.headers.get('origin')}/login`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Botglam</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Botglam!</h1>
            <p style="color: #f3edff; margin: 10px 0 0 0; font-size: 16px;">Your beauty appointment platform</p>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${clientName}!</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${professionalName} has created an account for you on Botglam to make booking appointments easier than ever!
            </p>
            
            ${welcomeMessage ? `
              <div style="background: white; padding: 15px; border-left: 4px solid #9333ea; margin: 20px 0;">
                <p style="margin: 0; font-style: italic;">"${welcomeMessage}"</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">- ${professionalName}</p>
              </div>
            ` : ''}
            
            <h3 style="color: #1f2937; margin-top: 25px;">Your Account Details:</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #dc2626; font-weight: bold;">🔒 Important Security Notice:</p>
              <p style="margin: 10px 0 0 0; color: #dc2626;">Please change your password immediately after logging in for the first time.</p>
            </div>
            
            <h3 style="color: #1f2937; margin-top: 25px;">What you can do with your account:</h3>
            <ul style="padding-left: 20px; margin-bottom: 25px;">
              <li style="margin-bottom: 8px;">📅 Book appointments online 24/7</li>
              <li style="margin-bottom: 8px;">📱 Receive automatic appointment reminders</li>
              <li style="margin-bottom: 8px;">💬 Message ${professionalName} directly</li>
              <li style="margin-bottom: 8px;">📋 View your appointment history</li>
              <li style="margin-bottom: 8px;">⚡ Quick rebooking of your favorite services</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #0ea5e9;">
            <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
              <strong>Need Help?</strong> If you have any questions about your account or booking appointments, 
              feel free to reply to this email or contact ${professionalName} directly.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              This account was created by ${professionalName} through Botglam.<br>
              If you didn't expect this email, please contact ${professionalName} directly.
            </p>
          </div>
        </body>
      </html>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Botglam <ayomide@codemygig.com>',
        to: [clientEmail],
        subject: `Welcome to Botglam - Account Created by ${professionalName}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error(`Failed to send email: ${errorText}`)
      
      // Still return success since the account was created
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Client account created successfully, but email could not be sent',
          tempPassword,
          emailError: errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Client account created and invitation sent successfully!',
        emailId: emailResult.id,
        tempPassword
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating client account:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
