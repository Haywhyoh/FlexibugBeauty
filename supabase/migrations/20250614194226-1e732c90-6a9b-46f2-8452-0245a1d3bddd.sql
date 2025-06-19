
-- Create the missing RPC function that the edge function is trying to call
CREATE OR REPLACE FUNCTION public.create_lead_with_task(
  p_form_id uuid,
  p_professional_id uuid,
  p_data jsonb,
  p_score text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_id uuid;
  task_title text;
  task_due_date timestamp with time zone;
  task_priority text;
BEGIN
  -- Insert the lead first
  INSERT INTO public.leads (
    form_id,
    professional_id,
    data,
    score,
    status
  ) VALUES (
    p_form_id,
    p_professional_id,
    p_data,
    p_score,
    'new'
  ) RETURNING id INTO lead_id;

  -- Determine task details based on score
  CASE p_score
    WHEN 'hot' THEN
      task_title := 'URGENT: Contact hot lead within 1 hour';
      task_due_date := now() + interval '1 hour';
      task_priority := 'urgent';
    WHEN 'warm' THEN
      task_title := 'Follow up with warm lead within 24 hours';
      task_due_date := now() + interval '1 day';
      task_priority := 'high';
    ELSE
      task_title := 'Follow up with lead within 3 days';
      task_due_date := now() + interval '3 days';
      task_priority := 'medium';
  END CASE;

  -- Insert the follow-up task
  INSERT INTO public.follow_up_tasks (
    lead_id,
    professional_id,
    task_type,
    title,
    description,
    due_date,
    priority
  ) VALUES (
    lead_id,
    p_professional_id,
    'call',
    task_title,
    'New lead submission requires follow-up contact',
    task_due_date,
    task_priority
  );

  RETURN lead_id;
END;
$$;

-- Temporarily disable the trigger that's causing conflicts
DROP TRIGGER IF EXISTS trigger_process_new_lead ON public.leads;
