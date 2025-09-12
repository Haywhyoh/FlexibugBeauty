-- Create guest_clients table for unregistered users who make bookings
CREATE TABLE public.guest_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN last_name IS NOT NULL AND last_name != '' 
      THEN first_name || ' ' || last_name
      ELSE first_name
    END
  ) STORED,
  
  -- Booking stats
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  first_booking_date TIMESTAMP WITH TIME ZONE,
  last_booking_date TIMESTAMP WITH TIME ZONE,
  
  -- Conversion tracking
  converted_to_user_id UUID REFERENCES auth.users(id),
  conversion_date TIMESTAMP WITH TIME ZONE,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Client preferences and notes
  notes TEXT,
  preferences JSONB DEFAULT '{}',
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Metadata
  source TEXT, -- 'booking', 'form', 'manual'
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique email per professional
  UNIQUE(professional_id, email)
);

-- Modify appointments table to support guest clients
ALTER TABLE public.appointments 
ADD COLUMN guest_client_id UUID REFERENCES public.guest_clients(id) ON DELETE SET NULL;

-- Add check constraint to ensure either client_id OR guest_client_id is set
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_client_check 
CHECK (
  (client_id IS NOT NULL AND guest_client_id IS NULL) OR 
  (client_id IS NULL AND guest_client_id IS NOT NULL) OR
  (client_id IS NULL AND guest_client_id IS NULL AND client_name IS NOT NULL)
);

-- Add payment tracking columns to appointments
ALTER TABLE public.appointments 
ADD COLUMN deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
ADD COLUMN deposit_paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN total_amount DECIMAL(10,2),
ADD COLUMN deposit_amount DECIMAL(10,2);

-- Enable RLS on guest_clients
ALTER TABLE public.guest_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guest_clients
CREATE POLICY "Professionals can view their own guest clients"
  ON public.guest_clients FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create guest clients"
  ON public.guest_clients FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own guest clients"
  ON public.guest_clients FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can view their own converted guest client record"
  ON public.guest_clients FOR SELECT
  USING (auth.uid() = converted_to_user_id);

-- Create indexes for performance
CREATE INDEX idx_guest_clients_professional ON public.guest_clients(professional_id);
CREATE INDEX idx_guest_clients_email ON public.guest_clients(professional_id, email);
CREATE INDEX idx_guest_clients_converted_user ON public.guest_clients(converted_to_user_id);
CREATE INDEX idx_guest_clients_invitation_token ON public.guest_clients(invitation_token);
CREATE INDEX idx_appointments_guest_client ON public.appointments(guest_client_id);

-- Function to update guest client stats
CREATE OR REPLACE FUNCTION update_guest_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update guest client stats when appointments are created/updated/deleted
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update stats for new/updated appointments
    IF NEW.guest_client_id IS NOT NULL THEN
      UPDATE public.guest_clients 
      SET 
        total_bookings = (
          SELECT COUNT(*) 
          FROM public.appointments 
          WHERE guest_client_id = NEW.guest_client_id AND status != 'cancelled'
        ),
        total_spent = (
          SELECT COALESCE(SUM(total_amount), 0)
          FROM public.appointments 
          WHERE guest_client_id = NEW.guest_client_id AND status = 'completed' AND payment_status IN ('paid', 'partial')
        ),
        first_booking_date = (
          SELECT MIN(start_time)
          FROM public.appointments 
          WHERE guest_client_id = NEW.guest_client_id AND status != 'cancelled'
        ),
        last_booking_date = (
          SELECT MAX(start_time)
          FROM public.appointments 
          WHERE guest_client_id = NEW.guest_client_id AND status != 'cancelled'
        ),
        updated_at = now()
      WHERE id = NEW.guest_client_id;
    END IF;
  END IF;
  
  -- Handle deletions
  IF TG_OP = 'DELETE' THEN
    IF OLD.guest_client_id IS NOT NULL THEN
      UPDATE public.guest_clients 
      SET 
        total_bookings = (
          SELECT COUNT(*) 
          FROM public.appointments 
          WHERE guest_client_id = OLD.guest_client_id AND status != 'cancelled'
        ),
        total_spent = (
          SELECT COALESCE(SUM(total_amount), 0)
          FROM public.appointments 
          WHERE guest_client_id = OLD.guest_client_id AND status = 'completed' AND payment_status IN ('paid', 'partial')
        ),
        updated_at = now()
      WHERE id = OLD.guest_client_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update guest client stats
CREATE TRIGGER update_guest_client_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_client_stats();

-- Function to create or find guest client
CREATE OR REPLACE FUNCTION upsert_guest_client(
  p_professional_id UUID,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'booking'
)
RETURNS UUID AS $$
DECLARE
  guest_client_id UUID;
  calculated_first_name TEXT;
  calculated_last_name TEXT;
BEGIN
  -- Parse full_name if first_name/last_name not provided
  IF p_first_name IS NULL AND p_full_name IS NOT NULL THEN
    calculated_first_name := split_part(p_full_name, ' ', 1);
    calculated_last_name := CASE 
      WHEN array_length(string_to_array(p_full_name, ' '), 1) > 1 
      THEN substring(p_full_name from length(calculated_first_name) + 2)
      ELSE NULL
    END;
  ELSE
    calculated_first_name := p_first_name;
    calculated_last_name := p_last_name;
  END IF;
  
  -- Try to find existing guest client
  SELECT id INTO guest_client_id
  FROM public.guest_clients
  WHERE professional_id = p_professional_id 
    AND email = p_email;
  
  -- Create new guest client if not found
  IF guest_client_id IS NULL THEN
    INSERT INTO public.guest_clients (
      professional_id,
      email,
      phone,
      first_name,
      last_name,
      source,
      first_booking_date
    ) VALUES (
      p_professional_id,
      p_email,
      p_phone,
      calculated_first_name,
      calculated_last_name,
      p_source,
      now()
    )
    RETURNING id INTO guest_client_id;
  ELSE
    -- Update existing guest client with latest info
    UPDATE public.guest_clients 
    SET 
      phone = COALESCE(p_phone, phone),
      first_name = COALESCE(calculated_first_name, first_name),
      last_name = COALESCE(calculated_last_name, last_name),
      updated_at = now()
    WHERE id = guest_client_id;
  END IF;
  
  RETURN guest_client_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps
CREATE TRIGGER update_guest_clients_updated_at
  BEFORE UPDATE ON public.guest_clients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();