-- Final fixed migration script to handle existing guest bookings
-- This will create guest client records for existing appointments with guest data

DO $$
DECLARE
  appointment_record RECORD;
  new_guest_client_id UUID;
  appointments_updated INTEGER;
BEGIN
  -- Check if upsert_guest_client function exists
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'upsert_guest_client') THEN
    RAISE EXCEPTION 'Function upsert_guest_client does not exist. Please run the previous migration first.';
  END IF;

  -- Loop through appointments that have client contact info but no client_id or guest_client_id
  FOR appointment_record IN 
    SELECT DISTINCT 
      a.professional_id,
      a.client_email,
      a.client_name,
      a.client_phone,
      a.created_at
    FROM public.appointments a
    WHERE a.client_id IS NULL 
      AND a.guest_client_id IS NULL
      AND a.client_email IS NOT NULL 
      AND a.client_name IS NOT NULL
      AND a.client_email != ''
      AND a.client_name != ''
  LOOP
    -- Create or find guest client for this appointment
    -- Call with correct parameter order: professional_id, email, phone, first_name, last_name, full_name, source
    SELECT upsert_guest_client(
      appointment_record.professional_id,  -- p_professional_id
      appointment_record.client_email,     -- p_email  
      appointment_record.client_phone,     -- p_phone
      NULL,                                -- p_first_name (will be parsed from full_name)
      NULL,                                -- p_last_name (will be parsed from full_name)
      appointment_record.client_name,      -- p_full_name
      'migration'                          -- p_source
    ) INTO new_guest_client_id;
    
    -- Update all appointments for this professional/email combination
    UPDATE public.appointments 
    SET guest_client_id = new_guest_client_id
    WHERE professional_id = appointment_record.professional_id
      AND client_email = appointment_record.client_email
      AND client_id IS NULL
      AND guest_client_id IS NULL;
    
    GET DIAGNOSTICS appointments_updated = ROW_COUNT;
    
    RAISE NOTICE 'Created/found guest client % for email % (professional %) and updated % appointments', 
      new_guest_client_id, appointment_record.client_email, appointment_record.professional_id, appointments_updated;
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully';
END $$;

-- Update appointment statistics after migration
-- This will refresh all the guest client stats based on their appointments
DO $$
DECLARE
  client_record RECORD;
  stats_updated INTEGER := 0;
BEGIN
  FOR client_record IN SELECT id FROM public.guest_clients LOOP
    UPDATE public.guest_clients 
    SET 
      total_bookings = (
        SELECT COUNT(*) 
        FROM public.appointments 
        WHERE guest_client_id = client_record.id AND (status IS NULL OR status != 'cancelled')
      ),
      total_spent = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.appointments 
        WHERE guest_client_id = client_record.id 
          AND (status = 'completed' OR status IS NULL)
          AND (payment_status IN ('paid', 'partial') OR payment_status IS NULL)
      ),
      first_booking_date = (
        SELECT MIN(start_time)
        FROM public.appointments 
        WHERE guest_client_id = client_record.id AND (status IS NULL OR status != 'cancelled')
      ),
      last_booking_date = (
        SELECT MAX(start_time)
        FROM public.appointments 
        WHERE guest_client_id = client_record.id AND (status IS NULL OR status != 'cancelled')
      ),
      updated_at = now()
    WHERE id = client_record.id;
    
    stats_updated := stats_updated + 1;
  END LOOP;
  
  RAISE NOTICE 'Guest client statistics updated successfully for % clients', stats_updated;
END $$;

-- Add comment to track migration
COMMENT ON TABLE public.guest_clients IS 'Guest clients table created on 2025-09-12. Migrated existing guest bookings.';

-- Show migration results
SELECT 
  'Migration Results' as info,
  (SELECT COUNT(*) FROM public.guest_clients) as total_guest_clients_created,
  (SELECT COUNT(*) FROM public.appointments WHERE guest_client_id IS NOT NULL) as appointments_linked_to_guests,
  (SELECT COUNT(*) FROM public.appointments WHERE client_id IS NULL AND guest_client_id IS NULL AND client_email IS NOT NULL) as remaining_unlinked_appointments;

-- Show some sample guest clients created
SELECT 
  'Sample Guest Clients' as info,
  gc.email,
  gc.first_name,
  gc.last_name,
  gc.total_bookings,
  gc.source,
  gc.created_at
FROM public.guest_clients gc
ORDER BY gc.created_at DESC
LIMIT 5;