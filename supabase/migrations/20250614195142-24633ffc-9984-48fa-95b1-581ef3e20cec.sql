
-- Add email tracking columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN reminder_sent_24h BOOLEAN DEFAULT FALSE,
ADD COLUMN reminder_sent_2h BOOLEAN DEFAULT FALSE,
ADD COLUMN follow_up_sent BOOLEAN DEFAULT FALSE;

-- Create email notification settings table
CREATE TABLE public.email_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES auth.users NOT NULL,
  confirmation_enabled BOOLEAN DEFAULT TRUE,
  reminder_24h_enabled BOOLEAN DEFAULT TRUE,
  reminder_2h_enabled BOOLEAN DEFAULT TRUE,
  follow_up_enabled BOOLEAN DEFAULT TRUE,
  custom_confirmation_message TEXT,
  custom_reminder_message TEXT,
  custom_follow_up_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to email notification settings
ALTER TABLE public.email_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows professionals to view their own settings
CREATE POLICY "Professionals can view their own email settings" 
  ON public.email_notification_settings 
  FOR SELECT 
  USING (auth.uid() = professional_id);

-- Create policy that allows professionals to insert their own settings
CREATE POLICY "Professionals can create their own email settings" 
  ON public.email_notification_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = professional_id);

-- Create policy that allows professionals to update their own settings
CREATE POLICY "Professionals can update their own email settings" 
  ON public.email_notification_settings 
  FOR UPDATE 
  USING (auth.uid() = professional_id);

-- Create policy that allows professionals to delete their own settings
CREATE POLICY "Professionals can delete their own email settings" 
  ON public.email_notification_settings 
  FOR DELETE 
  USING (auth.uid() = professional_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_email_notification_settings_updated_at
  BEFORE UPDATE ON public.email_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to ensure one settings record per professional
ALTER TABLE public.email_notification_settings 
ADD CONSTRAINT email_notification_settings_professional_id_unique 
UNIQUE (professional_id);
