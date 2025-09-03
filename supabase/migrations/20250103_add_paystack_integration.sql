-- Add Paystack integration fields and payment system
-- Migration: 20250103_add_paystack_integration

-- Add bank account fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_code TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS account_name TEXT,
ADD COLUMN IF NOT EXISTS account_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_subaccount_id INTEGER,
ADD COLUMN IF NOT EXISTS bank_setup_completed BOOLEAN DEFAULT FALSE;

-- Add comments for bank account fields
COMMENT ON COLUMN profiles.bank_name IS 'Name of the bank';
COMMENT ON COLUMN profiles.bank_code IS 'Paystack bank code';
COMMENT ON COLUMN profiles.account_number IS '10-digit bank account number';
COMMENT ON COLUMN profiles.account_name IS 'Verified account name from bank';
COMMENT ON COLUMN profiles.account_verified IS 'Whether bank account has been verified with Paystack';
COMMENT ON COLUMN profiles.paystack_subaccount_code IS 'Paystack subaccount code for split payments';
COMMENT ON COLUMN profiles.paystack_subaccount_id IS 'Paystack subaccount ID';
COMMENT ON COLUMN profiles.bank_setup_completed IS 'Whether professional has completed bank account setup';

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    
    -- Payment details
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'NGN',
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'full_payment', 'refund', 'cancellation_fee')),
    
    -- Paystack details
    paystack_reference TEXT UNIQUE,
    paystack_access_code TEXT,
    authorization_url TEXT,
    
    -- Status and metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
    gateway_response TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT unique_paystack_reference UNIQUE (paystack_reference)
);

-- Add comments for payment transactions
COMMENT ON TABLE payment_transactions IS 'All payment transactions processed through Paystack';
COMMENT ON COLUMN payment_transactions.amount IS 'Amount in Naira (not kobo)';
COMMENT ON COLUMN payment_transactions.transaction_type IS 'Type of transaction: deposit, full_payment, refund, cancellation_fee';
COMMENT ON COLUMN payment_transactions.paystack_reference IS 'Unique Paystack transaction reference';
COMMENT ON COLUMN payment_transactions.status IS 'Current status of the transaction';
COMMENT ON COLUMN payment_transactions.metadata IS 'Additional transaction metadata as JSON';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_professional_id ON payment_transactions(professional_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_appointment_id ON payment_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Add payment-related fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) CHECK (deposit_amount >= 0),
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) CHECK (total_amount >= 0),
ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add comments for appointment payment fields
COMMENT ON COLUMN appointments.deposit_required IS 'Whether this appointment requires a deposit';
COMMENT ON COLUMN appointments.deposit_amount IS 'Deposit amount required in Naira';
COMMENT ON COLUMN appointments.deposit_paid IS 'Whether deposit has been paid';
COMMENT ON COLUMN appointments.payment_status IS 'Overall payment status for the appointment';
COMMENT ON COLUMN appointments.total_amount IS 'Total amount for the appointment in Naira';
COMMENT ON COLUMN appointments.deposit_paid_at IS 'When the deposit was paid';
COMMENT ON COLUMN appointments.payment_reference IS 'Primary payment reference for this appointment';

-- Enable RLS on payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON payment_transactions;
CREATE POLICY "Users can view their own transactions"
    ON payment_transactions FOR SELECT
    USING (user_id = auth.uid() OR professional_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own transactions" ON payment_transactions;
CREATE POLICY "Users can insert their own transactions"
    ON payment_transactions FOR INSERT
    WITH CHECK (user_id = auth.uid() OR professional_id = auth.uid());

DROP POLICY IF EXISTS "System can update transaction status" ON payment_transactions;
CREATE POLICY "System can update transaction status"
    ON payment_transactions FOR UPDATE
    USING (true); -- This will be handled by backend/webhook functions

-- Add updated_at trigger for payment_transactions
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing appointments to have payment_status
UPDATE appointments 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Create a function to calculate deposit amount based on service and professional settings
CREATE OR REPLACE FUNCTION calculate_deposit_amount(service_price DECIMAL, deposit_type TEXT, deposit_percentage INTEGER, deposit_fixed_amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF deposit_type = 'percentage' AND deposit_percentage IS NOT NULL AND service_price IS NOT NULL THEN
        RETURN ROUND((service_price * deposit_percentage / 100.0), 2);
    ELSIF deposit_type = 'fixed' AND deposit_fixed_amount IS NOT NULL THEN
        RETURN deposit_fixed_amount;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add deposit settings to profiles for professionals
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS deposit_settings JSONB DEFAULT '{
    "require_deposit": false,
    "deposit_type": "percentage",
    "deposit_percentage": 25,
    "deposit_fixed_amount": 5000,
    "deposit_policy": "Deposits are required to secure your appointment and are non-refundable if cancelled within 24 hours."
}';

COMMENT ON COLUMN profiles.deposit_settings IS 'JSON object containing deposit requirements settings for professionals';

-- Create function to get professional deposit settings
CREATE OR REPLACE FUNCTION get_deposit_settings(professional_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    settings JSONB;
BEGIN
    SELECT deposit_settings INTO settings
    FROM profiles 
    WHERE id = professional_user_id;
    
    -- Return default settings if none exist
    IF settings IS NULL THEN
        RETURN '{
            "require_deposit": false,
            "deposit_type": "percentage",
            "deposit_percentage": 25,
            "deposit_fixed_amount": 5000,
            "deposit_policy": "Deposits are required to secure your appointment and are non-refundable if cancelled within 24 hours."
        }'::JSONB;
    END IF;
    
    RETURN settings;
END;
$$ LANGUAGE plpgsql;

-- Create view for appointment payment summary
CREATE OR REPLACE VIEW appointment_payment_summary AS
SELECT 
    a.id as appointment_id,
    a.client_id as user_id,
    a.professional_id,
    a.service_id,
    a.total_amount,
    a.deposit_required,
    a.deposit_amount,
    a.deposit_paid,
    a.payment_status,
    a.deposit_paid_at,
    s.name as service_name,
    s.price as service_price,
    COUNT(pt.id) as transaction_count,
    SUM(CASE WHEN pt.status = 'success' AND pt.transaction_type IN ('deposit', 'full_payment') THEN pt.amount ELSE 0 END) as amount_paid,
    MAX(CASE WHEN pt.status = 'success' AND pt.transaction_type = 'deposit' THEN pt.paid_at END) as deposit_paid_date,
    STRING_AGG(CASE WHEN pt.status = 'success' THEN pt.paystack_reference END, ', ') as payment_references
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN payment_transactions pt ON a.id = pt.appointment_id
GROUP BY a.id, a.client_id, a.professional_id, a.service_id, a.total_amount, 
         a.deposit_required, a.deposit_amount, a.deposit_paid, a.payment_status, 
         a.deposit_paid_at, s.name, s.price;

COMMENT ON VIEW appointment_payment_summary IS 'Summary view of appointment payment status and transactions';

-- Grant permissions on the view
GRANT SELECT ON appointment_payment_summary TO authenticated;