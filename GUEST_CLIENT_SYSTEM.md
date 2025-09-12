# Guest Client Management System

## Overview

The Guest Client Management System addresses the issue where unregistered users making payments caused `clientUserId is not defined` errors. This system provides a comprehensive solution for managing both registered and unregistered (guest) clients.

## Problem Solved

**Original Issue**: When unregistered users made payments via the booking system, the `DepositPaymentHandler.tsx` would fail with `clientUserId is not defined` because the system expected all clients to have user accounts.

**Solution**: Created a dual-client system that handles both authenticated users and guest clients seamlessly.

## Architecture

### Database Schema

#### New Tables

1. **`guest_clients`** - Stores unregistered client information
   - `id` - Primary key
   - `professional_id` - Links to the beauty professional
   - `email` - Guest client email (unique per professional)
   - `phone` - Optional phone number
   - `first_name`, `last_name` - Name fields
   - `full_name` - Computed field combining names
   - Booking statistics (`total_bookings`, `total_spent`, etc.)
   - Conversion tracking (`converted_to_user_id`, `invitation_token`, etc.)
   - Metadata and preferences

2. **Enhanced `appointments` table**
   - Added `guest_client_id` - Links to guest clients
   - Added `deposit_paid`, `payment_status`, `deposit_paid_at`
   - Added `total_amount`, `deposit_amount`
   - Constraint ensures either `client_id` OR `guest_client_id` is set

### Key Functions

- **`upsert_guest_client()`** - Creates or finds guest client records
- **`update_guest_client_stats()`** - Maintains booking statistics
- **Triggers** - Auto-update stats when appointments change

## Implementation Details

### 1. Payment Handler Fix (`DepositPaymentHandler.tsx`)

```typescript
// Before: clientUserId was undefined for guest bookings
client_id: clientUserId, // ❌ Error: clientUserId not defined

// After: Proper handling of both user types
if (appointment_data.user_id) {
  clientUserId = appointment_data.user_id; // Authenticated user
} else {
  guestClientId = await handleGuestClientBooking(appointment_data); // Guest user
}

// Create appointment with proper client linking
const appointmentInsertData = {
  client_id: clientUserId,        // For registered users
  guest_client_id: guestClientId, // For guest users
  // ... other fields
};
```

### 2. Unified Client Management (`useUnifiedClients.ts`)

The hook provides a unified interface for managing both client types:

```typescript
interface UnifiedClient {
  id: string;
  type: 'registered' | 'guest';
  name: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  canInvite: boolean; // For guest-to-registered conversion
  // ... other fields
}
```

### 3. Guest-to-Registered Conversion Flow

1. **Invitation**: Professionals can invite guest clients to create accounts
2. **Token Generation**: Secure invitation tokens with expiry dates
3. **Registration Page**: `/invite/:token` route for guest registration
4. **Account Creation**: Creates auth user and links to existing booking history
5. **Data Migration**: Updates guest client record with new user ID

## Components

### Core Components

1. **`UnifiedClientsView.tsx`** - Enhanced client management interface
   - Shows both registered and guest clients
   - Provides invitation functionality
   - Unified statistics and filtering

2. **`GuestInvitationPage.tsx`** - Guest registration page
   - Validates invitation tokens
   - Handles account creation
   - Links existing booking history

3. **`useUnifiedClients.ts`** - Main data management hook
   - Fetches and combines both client types
   - Provides CRUD operations
   - Handles invitations

### Enhanced Features

- **Client Statistics**: Unified view of all client metrics
- **Invitation System**: Email invitations for guest clients
- **Conversion Tracking**: Monitor guest-to-registered conversions
- **Notes Management**: Add notes to any client type
- **Filtering**: Filter by client type, status, value, etc.

## Migration Strategy

### Safe Migration Process

1. **Schema Creation**: New tables created without affecting existing data
2. **Data Migration**: `20250912150001_migrate_existing_guest_bookings.sql`
   - Identifies existing guest bookings
   - Creates guest client records
   - Links appointments to new guest clients
3. **Backwards Compatibility**: Existing `client_name`, `client_email` fields preserved

### Migration Script

```sql
-- Creates guest clients for existing guest bookings
DO $$
DECLARE
  appointment_record RECORD;
  guest_client_id UUID;
BEGIN
  FOR appointment_record IN 
    SELECT DISTINCT professional_id, client_email, client_name, client_phone
    FROM appointments 
    WHERE client_id IS NULL AND guest_client_id IS NULL 
      AND client_email IS NOT NULL
  LOOP
    guest_client_id := upsert_guest_client(/* ... */);
    UPDATE appointments SET guest_client_id = guest_client_id WHERE /* ... */;
  END LOOP;
END $$;
```

## Usage Examples

### For Developers

#### Creating a Guest Client

```typescript
// During booking process
const guestClientId = await supabase.rpc('upsert_guest_client', {
  p_professional_id: professionalId,
  p_email: clientEmail,
  p_full_name: clientName,
  p_phone: clientPhone,
  p_source: 'booking'
});
```

#### Fetching Unified Clients

```typescript
const { clients, inviteGuestClient } = useUnifiedClients();

// clients array contains both registered and guest clients
clients.forEach(client => {
  console.log(`${client.name} (${client.type}): ${client.totalBookings} bookings`);
});
```

#### Inviting Guest to Register

```typescript
await inviteGuestClient(guestClient.id);
// Sends invitation email with secure token
```

### For Beauty Professionals

1. **View All Clients**: See registered and guest clients in one interface
2. **Client Statistics**: Track bookings and spending across all client types
3. **Invite Guests**: Convert valuable guest clients to registered users
4. **Manage Notes**: Add notes and track preferences for any client

## Security & Privacy

- **RLS Policies**: Row Level Security ensures professionals only see their clients
- **Token Security**: Invitation tokens are cryptographically secure with expiration
- **Data Protection**: Guest client data is properly isolated and protected
- **Consent Tracking**: Marketing consent is tracked separately

## Benefits

1. **No More Payment Errors**: Eliminates `clientUserId is not defined` errors
2. **Better Client Management**: Unified view of all clients regardless of registration status
3. **Improved Conversion**: Easy guest-to-registered client conversion
4. **Enhanced Analytics**: Complete client lifecycle tracking
5. **Future-Proof**: Scalable architecture for additional client features

## API Endpoints

### Database Functions
- `upsert_guest_client()` - Create or update guest client
- `update_guest_client_stats()` - Refresh statistics

### Routes
- `/invite/:token` - Guest invitation acceptance page
- Internal APIs handle client CRUD operations through Supabase

## Testing

### Test Scenarios

1. **Guest Booking**: Unregistered user makes booking and payment
2. **Invitation Flow**: Professional invites guest, guest creates account
3. **Data Migration**: Existing guest bookings are properly migrated
4. **Statistics**: Client stats are correctly calculated and updated

### Validation Points

- ✅ No `clientUserId` errors during payment
- ✅ Guest clients appear in unified client list
- ✅ Invitation tokens work and expire properly
- ✅ Account creation links existing booking history
- ✅ Statistics update correctly for all operations

## Future Enhancements

- **Email Integration**: Automated invitation emails
- **SMS Notifications**: Text message invitations and confirmations
- **Advanced Analytics**: Conversion rate tracking and insights
- **Bulk Operations**: Mass invitation and management tools
- **API Webhooks**: External integrations for client events

---

This system provides a robust, scalable solution for managing both registered and guest clients while maintaining backwards compatibility and data integrity.