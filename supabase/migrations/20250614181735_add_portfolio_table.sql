
-- Add lead conversion tracking fields to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS lead_source text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS follow_up_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_contact_date timestamp with time zone;

-- Create lead_activities table for tracking interactions
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL,
  activity_type text NOT NULL, -- 'email_sent', 'call_made', 'meeting_scheduled', 'note_added'
  activity_data jsonb DEFAULT '{}',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on lead_activities
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_activities
CREATE POLICY "Users can view their own lead activities" 
  ON public.lead_activities 
  FOR SELECT 
  USING (professional_id = auth.uid());

CREATE POLICY "Users can create their own lead activities" 
  ON public.lead_activities 
  FOR INSERT 
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Users can update their own lead activities" 
  ON public.lead_activities 
  FOR UPDATE 
  USING (professional_id = auth.uid());

CREATE POLICY "Users can delete their own lead activities" 
  ON public.lead_activities 
  FOR DELETE 
  USING (professional_id = auth.uid());

-- Create follow_up_tasks table
CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL,
  task_type text NOT NULL, -- 'call', 'email', 'meeting', 'custom'
  title text NOT NULL,
  description text,
  due_date timestamp with time zone NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on follow_up_tasks
ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for follow_up_tasks
CREATE POLICY "Users can view their own follow up tasks" 
  ON public.follow_up_tasks 
  FOR SELECT 
  USING (professional_id = auth.uid());

CREATE POLICY "Users can create their own follow up tasks" 
  ON public.follow_up_tasks 
  FOR INSERT 
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Users can update their own follow up tasks" 
  ON public.follow_up_tasks 
  FOR UPDATE 
  USING (professional_id = auth.uid());

CREATE POLICY "Users can delete their own follow up tasks" 
  ON public.follow_up_tasks 
  FOR DELETE 
  USING (professional_id = auth.uid());

-- Create function to automatically score leads
CREATE OR REPLACE FUNCTION public.calculate_lead_score(lead_data jsonb, form_fields jsonb)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  score integer := 0;
  field jsonb;
  has_phone boolean := false;
  has_specific_service boolean := false;
  has_preferred_date boolean := false;
  has_budget boolean := false;
BEGIN
  -- Check for phone number (high value indicator)
  FOR field IN SELECT * FROM jsonb_array_elements(form_fields)
  LOOP
    IF (field->>'type' = 'phone' AND lead_data ? (field->>'id') AND lead_data->(field->>'id') IS NOT NULL AND lead_data->>(field->>'id') != '') THEN
      has_phone := true;
      score := score + 30;
    END IF;
    
    -- Check for specific service interest
    IF (field->>'type' = 'select' AND lower(field->>'label') LIKE '%service%' AND lead_data ? (field->>'id')) THEN
      has_specific_service := true;
      score := score + 25;
    END IF;
    
    -- Check for preferred date/time
    IF (field->>'type' IN ('date', 'datetime-local') AND lead_data ? (field->>'id')) THEN
      has_preferred_date := true;
      score := score + 20;
    END IF;
    
    -- Check for budget information
    IF (lower(field->>'label') LIKE '%budget%' AND lead_data ? (field->>'id')) THEN
      has_budget := true;
      score := score + 15;
    END IF;
  END LOOP;
  
  -- Base score for having contact info
  IF lead_data ? 'email' OR lead_data ? 'name' THEN
    score := score + 10;
  END IF;
  
  -- Determine score category
  IF score >= 70 THEN
    RETURN 'hot';
  ELSIF score >= 40 THEN
    RETURN 'warm';
  ELSE
    RETURN 'cold';
  END IF;
END;
$$;

-- Create trigger to auto-score leads and create follow-up tasks
CREATE OR REPLACE FUNCTION public.process_new_lead()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  form_fields jsonb;
  calculated_score text;
  task_title text;
  task_due_date timestamp with time zone;
BEGIN
  -- Get form fields for scoring
  SELECT fields INTO form_fields 
  FROM public.lead_forms 
  WHERE id = NEW.form_id;
  
  -- Calculate lead score
  calculated_score := public.calculate_lead_score(NEW.data, form_fields);
  
  -- Update the lead with calculated score
  NEW.score := calculated_score;
  
  -- Create appropriate follow-up task based on score
  CASE calculated_score
    WHEN 'hot' THEN
      task_title := 'URGENT: Contact hot lead within 1 hour';
      task_due_date := now() + interval '1 hour';
    WHEN 'warm' THEN
      task_title := 'Follow up with warm lead within 24 hours';
      task_due_date := now() + interval '1 day';
    ELSE
      task_title := 'Follow up with lead within 3 days';
      task_due_date := now() + interval '3 days';
  END CASE;
  
  -- Insert follow-up task
  INSERT INTO public.follow_up_tasks (
    lead_id,
    professional_id,
    task_type,
    title,
    description,
    due_date,
    priority
  ) VALUES (
    NEW.id,
    NEW.professional_id,
    'call',
    task_title,
    'New lead submission requires follow-up contact',
    task_due_date,
    CASE calculated_score
      WHEN 'hot' THEN 'urgent'
      WHEN 'warm' THEN 'high'
      ELSE 'medium'
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new leads
DROP TRIGGER IF EXISTS trigger_process_new_lead ON public.leads;
CREATE TRIGGER trigger_process_new_lead
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.process_new_lead();

-- Update existing leads with calculated scores
UPDATE public.leads 
SET score = public.calculate_lead_score(
  data, 
  (SELECT fields FROM public.lead_forms WHERE id = leads.form_id)
)
WHERE score IS NULL OR score = 'cold';
