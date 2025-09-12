-- Migration script to handle existing guest bookings
-- This will create guest client records for existing appointments with guest data

DO $$
DECLARE
  appointment_record RECORD;
  guest_client_id UUID;
BEGIN
  -- Loop through appointments that have client contact info but no client_id or guest_client_id
  FOR appointment_record IN 
    SELECT DISTINCT 
      professional_id,
      client_email,
      client_name,
      client_phone,
      created_at
    FROM public.appointments 
    WHERE client_id IS NULL 
      AND guest_client_id IS NULL 
      AND client_email IS NOT NULL 
      AND client_name IS NOT NULL
      AND client_email != ''
      AND client_name != ''
  LOOP
    -- Create or find guest client for this appointment
    guest_client_id := upsert_guest_client(
      appointment_record.professional_id,
      appointment_record.client_email,
      appointment_record.client_phone,
      appointment_record.client_name,
      NULL, -- last_name will be parsed from client_name
      NULL, -- full_name will use client_name
      'migration'
    );
    
    -- Update all appointments for this guest client
    UPDATE public.appointments 
    SET guest_client_id = guest_client_id
    WHERE professional_id = appointment_record.professional_id
      AND client_email = appointment_record.client_email
      AND client_id IS NULL
      AND guest_client_id IS NULL;
    
    RAISE NOTICE 'Created guest client % for email % and updated appointments', guest_client_id, appointment_record.client_email;
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully';
END $$;

-- Update appointment statistics after migration
SELECT update_guest_client_stats();

-- Add comment to track migration
COMMENT ON TABLE public.guest_clients IS 'Guest clients table created on 2025-09-12. Migrated existing guest bookings.';