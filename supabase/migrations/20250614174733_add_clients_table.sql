
-- Add conversion tracking to leads table
ALTER TABLE public.leads 
ADD COLUMN converted_to_user_id UUID REFERENCES auth.users(id),
ADD COLUMN conversion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN invitation_token TEXT UNIQUE;

-- Create client profiles table to link converted leads to user accounts
CREATE TABLE public.client_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  professional_id UUID REFERENCES auth.users(id) NOT NULL,
  original_lead_id UUID REFERENCES public.leads(id),
  client_since TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_appointments INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_appointment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create default form templates table
CREATE TABLE public.form_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('enquiry', 'appointment_request')),
  fields JSONB NOT NULL,
  is_system_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default form templates
INSERT INTO public.form_templates (name, description, template_type, fields, is_system_template) VALUES
(
  'General Enquiry Form',
  'Capture general interest and contact information from potential clients',
  'enquiry',
  '[
    {"id": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Enter your full name"},
    {"id": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "Enter your email"},
    {"id": "phone", "type": "phone", "label": "Phone Number", "required": false, "placeholder": "Enter your phone number"},
    {"id": "service_interest", "type": "select", "label": "Service Interest", "required": true, "options": ["Lash Extensions", "Eyebrow Microblading", "Makeup Services", "Skincare Treatment", "Other"]},
    {"id": "preferred_contact", "type": "select", "label": "Preferred Contact Method", "required": true, "options": ["Email", "Phone", "Text Message"]},
    {"id": "message", "type": "textarea", "label": "Additional Questions or Comments", "required": false, "placeholder": "Tell us more about what you''re looking for..."}
  ]'::jsonb,
  true
),
(
  'Appointment Request Form',
  'Capture specific appointment booking requests from potential clients',
  'appointment_request',
  '[
    {"id": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Enter your full name"},
    {"id": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "Enter your email"},
    {"id": "phone", "type": "phone", "label": "Phone Number", "required": true, "placeholder": "Enter your phone number"},
    {"id": "service_type", "type": "select", "label": "Service Type", "required": true, "options": ["Classic Lashes", "Volume Lashes", "Hybrid Lashes", "Lash Lift", "Eyebrow Microblading", "Makeup Application", "Other"]},
    {"id": "preferred_date", "type": "text", "label": "Preferred Date", "required": false, "placeholder": "Any preferred dates?"},
    {"id": "preferred_time", "type": "select", "label": "Preferred Time", "required": false, "options": ["Morning (9am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-8pm)", "Flexible"]},
    {"id": "experience_level", "type": "select", "label": "Experience with this service", "required": false, "options": ["First time", "Previous experience", "Regular client elsewhere"]},
    {"id": "special_requirements", "type": "textarea", "label": "Special Requirements or Allergies", "required": false, "placeholder": "Any allergies, sensitivities, or special requests?"}
  ]'::jsonb,
  true
);

-- Enable RLS on new tables
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
CREATE POLICY "Professionals can view their own clients"
  ON public.client_profiles FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Users can view their own client profile"
  ON public.client_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can create client profiles"
  ON public.client_profiles FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own client profiles"
  ON public.client_profiles FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- RLS Policies for form_templates
CREATE POLICY "Anyone can view form templates"
  ON public.form_templates FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_leads_converted_user ON public.leads(converted_to_user_id);
CREATE INDEX idx_leads_invitation_token ON public.leads(invitation_token);
CREATE INDEX idx_client_profiles_professional ON public.client_profiles(professional_id);
CREATE INDEX idx_client_profiles_user ON public.client_profiles(user_id);
CREATE INDEX idx_client_profiles_lead ON public.client_profiles(original_lead_id);

-- Function to update client profile stats
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update client profile when appointments are created/updated
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.client_profiles 
    SET 
      total_appointments = (
        SELECT COUNT(*) 
        FROM public.appointments 
        WHERE client_id = NEW.client_id AND status != 'cancelled'
      ),
      last_appointment_date = (
        SELECT MAX(start_time)
        FROM public.appointments 
        WHERE client_id = NEW.client_id AND status != 'cancelled'
      ),
      updated_at = now()
    WHERE user_id = NEW.client_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update client stats
CREATE TRIGGER update_client_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_stats();
