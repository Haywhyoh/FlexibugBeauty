-- Fix missing account_name column in profiles table
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Add the account_name column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_name TEXT;

-- Add comment for the column
COMMENT ON COLUMN public.profiles.account_name IS 'Verified account name from bank';

-- Ensure all other payment-related columns exist as well
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_code TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS account_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_subaccount_id INTEGER,
ADD COLUMN IF NOT EXISTS bank_setup_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_settings JSONB DEFAULT '{
    "require_deposit": false,
    "deposit_type": "percentage",
    "deposit_percentage": 25,
    "deposit_fixed_amount": 5000,
    "deposit_policy": "Deposits are required to secure your appointment and are non-refundable if cancelled within 24 hours."
}';

-- Add comments for all payment-related columns
COMMENT ON COLUMN public.profiles.bank_name IS 'Name of the bank';
COMMENT ON COLUMN public.profiles.bank_code IS 'Paystack bank code';
COMMENT ON COLUMN public.profiles.account_number IS '10-digit bank account number';
COMMENT ON COLUMN public.profiles.account_verified IS 'Whether bank account has been verified with Paystack';
COMMENT ON COLUMN public.profiles.paystack_subaccount_code IS 'Paystack subaccount code for split payments';
COMMENT ON COLUMN public.profiles.paystack_subaccount_id IS 'Paystack subaccount ID';
COMMENT ON COLUMN public.profiles.bank_setup_completed IS 'Whether professional has completed bank account setup';
COMMENT ON COLUMN public.profiles.deposit_settings IS 'JSON object containing deposit requirements settings for professionals';
