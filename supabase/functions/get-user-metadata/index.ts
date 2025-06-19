import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Get the authenticated user (professional)
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

    const { userIds } = await req.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('Invalid userIds provided')
    }

    // Get user metadata for the provided user IDs
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const requestedUsers = users.users?.filter(u => userIds.includes(u.id)) || []

    // Extract relevant metadata
    const userMetadata = requestedUsers.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || '',
      user_type: user.user_metadata?.user_type || 'client',
      created_at: user.created_at
    }))

    // Create missing profile records
    for (const userData of userMetadata) {
      if (userData.full_name) {
        const { error } = await supabaseClient
          .from('profiles')
          .upsert({
            id: userData.id,
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            user_type: userData.user_type,
            created_at: userData.created_at,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error creating profile for user', userData.id, ':', error)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        users: userMetadata 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: any) {
    console.error('Error getting user metadata:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 