
-- Create appointments table to store all bookings
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'confirmed',
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability table for professionals to set their working hours
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, day_of_week)
);

-- Create time blocks table for specific unavailable periods (vacations, breaks, etc.)
CREATE TABLE public.time_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT CHECK (type IN ('unavailable', 'break', 'vacation')) DEFAULT 'unavailable',
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Professionals can view their appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = professional_id);

CREATE POLICY "Clients can view their appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Anyone can view confirmed appointments for booking purposes" 
  ON public.appointments 
  FOR SELECT 
  USING (status = 'confirmed');

CREATE POLICY "Professionals can manage their appointments" 
  ON public.appointments 
  FOR ALL 
  USING (auth.uid() = professional_id);

CREATE POLICY "Clients can create appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (true); -- Allow anyone to book (including non-authenticated users)

-- RLS Policies for availability
CREATE POLICY "Anyone can view availability" 
  ON public.availability 
  FOR SELECT 
  USING (true);

CREATE POLICY "Professionals can manage their availability" 
  ON public.availability 
  FOR ALL 
  USING (auth.uid() = professional_id);

-- RLS Policies for time blocks
CREATE POLICY "Anyone can view time blocks" 
  ON public.time_blocks 
  FOR SELECT 
  USING (true);

CREATE POLICY "Professionals can manage their time blocks" 
  ON public.time_blocks 
  FOR ALL 
  USING (auth.uid() = professional_id);

-- Create indexes for performance
CREATE INDEX idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_availability_professional_id ON public.availability(professional_id);
CREATE INDEX idx_time_blocks_professional_id ON public.time_blocks(professional_id);
CREATE INDEX idx_time_blocks_time_range ON public.time_blocks(start_time, end_time);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON public.appointments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_updated_at 
  BEFORE UPDATE ON public.availability 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_blocks_updated_at 
  BEFORE UPDATE ON public.time_blocks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
