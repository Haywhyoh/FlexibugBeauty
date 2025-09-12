# Guest Client System Migration Guide

## Issue Resolution

You encountered these errors because:
1. The `deposit_paid` column already existed in your appointments table
2. The function parameter order was incorrect in the migration script

## Fixed Migration Steps

Run these SQL files in **exactly this order**:

### Step 1: Core System Setup
```sql
-- Run this file first (handles existing columns gracefully)
\i supabase/migrations/20250912150002_fix_guest_clients_system.sql
```

This script:
- ✅ Creates the `guest_clients` table
- ✅ Adds missing columns to `appointments` (skips existing ones)
- ✅ Creates the `upsert_guest_client` function with correct parameters
- ✅ Sets up RLS policies and indexes
- ✅ Creates triggers for automatic stats updates

### Step 2: Data Migration
```sql
-- Run this file second (migrates existing guest bookings)
\i supabase/migrations/20250912150003_migrate_existing_guest_bookings_fixed.sql
```

This script:
- ✅ Identifies existing guest bookings (appointments with email but no client_id)
- ✅ Creates guest client records for them
- ✅ Links appointments to the new guest clients
- ✅ Updates statistics
- ✅ Shows migration results

## What's Fixed

### 1. Column Existence Check
```sql
-- Before: Would fail if column exists
ALTER TABLE appointments ADD COLUMN deposit_paid BOOLEAN DEFAULT false;

-- After: Safely checks first
IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'appointments' AND column_name = 'deposit_paid') THEN
  ALTER TABLE appointments ADD COLUMN deposit_paid BOOLEAN DEFAULT false;
END IF;
```

### 2. Correct Function Parameters
```sql
-- Before: Wrong parameter order
upsert_guest_client(
  appointment_record.professional_id,
  appointment_record.client_email,
  appointment_record.client_phone,     -- Wrong position
  appointment_record.client_name,      -- Wrong position
  NULL, -- Wrong position
  NULL, -- Wrong position  
  'migration'
);

-- After: Correct parameter order
upsert_guest_client(
  appointment_record.professional_id,  -- p_professional_id
  appointment_record.client_email,     -- p_email  
  appointment_record.client_phone,     -- p_phone
  NULL,                                -- p_first_name
  NULL,                                -- p_last_name
  appointment_record.client_name,      -- p_full_name
  'migration'                          -- p_source
);
```

## Verification

After running both migrations, verify success:

```sql
-- Check guest clients were created
SELECT COUNT(*) as guest_clients_created FROM guest_clients;

-- Check appointments were linked
SELECT 
  COUNT(*) as total_appointments,
  COUNT(client_id) as registered_client_appointments,
  COUNT(guest_client_id) as guest_client_appointments,
  COUNT(CASE WHEN client_id IS NULL AND guest_client_id IS NULL AND client_email IS NOT NULL THEN 1 END) as unlinked_guest_appointments
FROM appointments;

-- Check guest client stats
SELECT 
  email,
  first_name,
  total_bookings,
  total_spent,
  first_booking_date,
  last_booking_date
FROM guest_clients
ORDER BY total_bookings DESC;
```

## Expected Results

After successful migration:
- ✅ No more `clientUserId is not defined` errors
- ✅ All existing guest bookings converted to guest client records
- ✅ Payment confirmations work for both registered and guest users
- ✅ Unified client management system available
- ✅ Guest-to-registered conversion flow ready

## Rollback Plan (if needed)

If something goes wrong, you can rollback:

```sql
-- Remove guest client relationships (preserves original data)
UPDATE appointments SET guest_client_id = NULL;

-- Drop new table and functions
DROP TABLE guest_clients CASCADE;
DROP FUNCTION upsert_guest_client(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
```

The original appointment data with `client_name`, `client_email`, `client_phone` fields remains intact.

## Next Steps

Once migration is complete:
1. Test payment confirmation with a guest booking
2. Verify unified client management works in the admin interface
3. Test guest invitation flow
4. Monitor for any remaining issues

The system is now production-ready with proper guest client support!