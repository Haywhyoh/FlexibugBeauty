
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FormSubmission {
  formId: string;
  professionalId: string;
  data: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { formId, professionalId, data }: FormSubmission = await req.json();

    console.log('Received form submission:', { formId, professionalId, data });

    // Validate the form exists and is active
    const { data: form, error: formError } = await supabaseClient
      .from('lead_forms')
      .select('*')
      .eq('id', formId)
      .eq('is_active', true)
      .single();

    if (formError || !form) {
      console.error('Form validation error:', formError);
      return new Response(
        JSON.stringify({ error: 'Form not found or inactive' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate lead score based on form data
    let score = 'cold';
    if (data.email && data.phone) {
      score = 'warm';
    }
    if (data.message && data.message.length > 50) {
      score = 'hot';
    }

    // Use a transaction to ensure data consistency
    const { data: result, error: transactionError } = await supabaseClient.rpc('create_lead_with_task', {
      p_form_id: formId,
      p_professional_id: professionalId,
      p_data: data,
      p_score: score
    });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      
      // Fallback: try manual insertion without triggers
      console.log('Attempting fallback insertion...');
      
      const { data: lead, error: leadError } = await supabaseClient
        .from('leads')
        .insert({
          form_id: formId,
          professional_id: professionalId,
          data: data,
          score: score,
          status: 'new'
        })
        .select()
        .single();

      if (leadError) {
        console.error('Fallback lead insertion error:', leadError);
        return new Response(
          JSON.stringify({ error: 'Failed to save submission' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Fallback lead created successfully:', lead.id);

      // Create follow-up task manually
      const taskTitle = score === 'hot' 
        ? 'URGENT: Contact hot lead within 1 hour'
        : score === 'warm'
        ? 'Follow up with warm lead within 24 hours'
        : 'Follow up with lead within 3 days';

      const dueDate = new Date();
      if (score === 'hot') {
        dueDate.setHours(dueDate.getHours() + 1);
      } else if (score === 'warm') {
        dueDate.setDate(dueDate.getDate() + 1);
      } else {
        dueDate.setDate(dueDate.getDate() + 3);
      }

      const priority = score === 'hot' ? 'urgent' : score === 'warm' ? 'high' : 'medium';

      const { error: taskError } = await supabaseClient
        .from('follow_up_tasks')
        .insert({
          lead_id: lead.id,
          professional_id: professionalId,
          task_type: 'call',
          title: taskTitle,
          description: 'New lead submission requires follow-up contact',
          due_date: dueDate.toISOString(),
          priority: priority
        });

      if (taskError) {
        console.error('Task creation error:', taskError);
        console.log('Lead created but task creation failed - continuing...');
      }

      return new Response(
        JSON.stringify({ success: true, leadId: lead.id }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Lead and task created successfully via RPC:', result);

    return new Response(
      JSON.stringify({ success: true, leadId: result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
