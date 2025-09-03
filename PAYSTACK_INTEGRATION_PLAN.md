# Paystack Integration & Bank Account Management Plan

## Overview
Implement comprehensive Paystack integration with bank account management, subaccount creation, deposit requirements, and appointment management enhancements.

## Phase 1: Paystack Bank Account Integration ✅ [IN PROGRESS]

### 1.1 Create Paystack Service Functions
- [ ] Create `src/services/paystackService.ts`
- [ ] Implement bank list fetching from Paystack API
- [ ] Implement bank account verification
- [ ] Add error handling and validation

### 1.2 Update PaymentSettings Component
- [ ] Replace existing payment methods with Paystack bank setup
- [ ] Add bank selection dropdown
- [ ] Create account number and bank code input
- [ ] Add account name verification display
- [ ] Implement save bank account functionality

### 1.3 Database Schema for Bank Accounts
- [ ] Add migration for bank account fields in profiles table
- [ ] Add fields: `bank_name`, `bank_code`, `account_number`, `account_name`, `account_verified`
- [ ] Add `paystack_subaccount_code` field

## Phase 2: Paystack Subaccount Management

### 2.1 Subaccount Creation
- [ ] Create subaccount when bank account is verified
- [ ] Store subaccount code in user profile
- [ ] Handle subaccount updates when bank details change
- [ ] Implement error handling for subaccount failures

### 2.2 Subaccount Management Functions
- [ ] Create subaccount creation function
- [ ] Implement subaccount update function
- [ ] Add subaccount retrieval function
- [ ] Handle subaccount deactivation

## Phase 3: Deposit Requirements Integration

### 3.1 Update Booking Flow
- [ ] Modify BookingEngine to check deposit requirements
- [ ] Create deposit payment component
- [ ] Implement Paystack payment initialization
- [ ] Add payment success/failure handling

### 3.2 Appointment Status Management
- [ ] Update appointment status enum (pending, confirmed, cancelled)
- [ ] Implement appointment confirmation after deposit
- [ ] Add deposit amount calculation based on service settings
- [ ] Create payment tracking system

### 3.3 Payment Processing
- [ ] Initialize Paystack payment with split
- [ ] Handle payment verification
- [ ] Update appointment status after payment
- [ ] Send confirmation notifications

## Phase 4: Appointment Management Enhancement

### 4.1 Appointments Page/Component
- [ ] Create `src/pages/Appointments.tsx`
- [ ] Create `src/components/AppointmentsList.tsx`
- [ ] Add appointment filtering and sorting
- [ ] Implement appointment search functionality

### 4.2 Appointment Actions
- [ ] Add reschedule appointment functionality
- [ ] Implement cancel appointment with policy enforcement
- [ ] Create view appointment details modal
- [ ] Add refund handling for cancellations

### 4.3 Payment History & Tracking
- [ ] Create payment history component
- [ ] Display deposit status and amounts
- [ ] Show transaction details
- [ ] Add receipt/invoice generation

## Phase 5: Database Schema Updates

### 5.1 Bank Account Fields (profiles table)
```sql
ALTER TABLE profiles ADD COLUMN bank_name TEXT;
ALTER TABLE profiles ADD COLUMN bank_code TEXT;
ALTER TABLE profiles ADD COLUMN account_number TEXT;
ALTER TABLE profiles ADD COLUMN account_name TEXT;
ALTER TABLE profiles ADD COLUMN account_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN paystack_subaccount_code TEXT;
```

### 5.2 Payment Transactions Table
```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id),
    user_id UUID REFERENCES profiles(id),
    professional_id UUID REFERENCES profiles(id),
    amount DECIMAL(10,2),
    transaction_type TEXT CHECK (transaction_type IN ('deposit', 'full_payment', 'refund')),
    paystack_reference TEXT,
    status TEXT CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.3 Update Appointments Table
```sql
ALTER TABLE appointments ADD COLUMN deposit_required BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN deposit_amount DECIMAL(10,2);
ALTER TABLE appointments ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN total_amount DECIMAL(10,2);
```

## Phase 6: Backend Integration & Webhooks

### 6.1 Paystack Webhook Handler
- [ ] Create webhook endpoint for payment verification
- [ ] Handle successful payment confirmations
- [ ] Update appointment and transaction status
- [ ] Send confirmation emails/notifications

### 6.2 Edge Functions (Supabase)
- [ ] Create bank verification edge function
- [ ] Implement subaccount creation edge function
- [ ] Add payment initialization edge function
- [ ] Create webhook handler edge function

## Phase 7: UI/UX Enhancements

### 7.1 Booking Flow Updates
- [ ] Update BookingPage to show deposit requirements
- [ ] Add payment step to booking process
- [ ] Display payment confirmation
- [ ] Show appointment pending status

### 7.2 Professional Dashboard
- [ ] Add earnings dashboard
- [ ] Show pending deposits
- [ ] Display bank account status
- [ ] Add payout history

### 7.3 Client Experience
- [ ] Show deposit requirements during booking
- [ ] Add payment history for clients
- [ ] Display appointment status clearly
- [ ] Provide payment receipts

## Implementation Priority

### Week 1: Foundation
1. Paystack service setup
2. Bank account verification
3. Database schema updates
4. PaymentSettings component updates

### Week 2: Core Payment Flow
1. Subaccount creation
2. Deposit payment integration
3. Booking flow updates
4. Payment processing

### Week 3: Appointment Management
1. Appointments page creation
2. Status management
3. Payment tracking
4. User interface enhancements

### Week 4: Polish & Testing
1. Webhook implementation
2. Error handling improvements
3. Testing and bug fixes
4. Documentation updates

## Success Metrics
- [ ] Professionals can add and verify bank accounts
- [ ] Subaccounts are automatically created
- [ ] Deposits are collected during booking
- [ ] Funds are split correctly to professional accounts
- [ ] Appointments are properly managed with payment status
- [ ] Payment history is accessible to both parties

## Notes
- Use Paystack test keys for development
- Implement comprehensive error handling
- Add loading states for all payment operations
- Ensure mobile responsiveness for all new components
- Follow existing code patterns and conventions