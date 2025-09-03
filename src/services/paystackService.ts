// Paystack API service for bank operations and payment processing

const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY || 'sk_test_2c94e5db7669c935c7ffbda128adb99ea092a15c';
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_ce0ef1a6cec49aa9ee67734026c9e0b0b1b869ef';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Bank interface definitions
export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

export interface BankAccountVerification {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export interface SubaccountData {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: number;
  description?: string;
  primary_contact_email?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  metadata?: Record<string, any>;
}

export interface PaystackSubaccount {
  id: number;
  subaccount_code: string;
  business_name: string;
  description: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  metadata: Record<string, any>;
  percentage_charge: number;
  settlement_bank: string;
  account_number: string;
  settlement_schedule: string;
  active: boolean;
  migrate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitialization {
  amount: number; // in kobo
  email: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[];
  split_code?: string;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: 'account' | 'subaccount';
}

// Helper function to make Paystack API calls
async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: boolean; message: string; data: T }> {
  const url = `${PAYSTACK_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Fetch all Nigerian banks from Paystack
export async function fetchBanks(): Promise<Bank[]> {
  try {
    const response = await paystackRequest<Bank[]>('/bank', {
      method: 'GET',
    });

    if (response.status && response.data) {
      // Filter for Nigerian banks and sort alphabetically
      return response.data
        .filter(bank => bank.country === 'Nigeria' && bank.active)
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    throw new Error(response.message || 'Failed to fetch banks');
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw new Error('Failed to fetch banks. Please try again.');
  }
}

// Verify bank account details
export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<BankAccountVerification> {
  try {
    if (!accountNumber || !bankCode) {
      throw new Error('Account number and bank code are required');
    }

    // Remove any spaces or special characters from account number
    const cleanAccountNumber = accountNumber.replace(/\s+/g, '').replace(/\D/g, '');
    
    if (cleanAccountNumber.length !== 10) {
      throw new Error('Account number must be exactly 10 digits');
    }

    const response = await paystackRequest<BankAccountVerification>(
      `/bank/resolve?account_number=${cleanAccountNumber}&bank_code=${bankCode}`,
      {
        method: 'GET',
      }
    );

    if (response.status && response.data) {
      return {
        account_number: cleanAccountNumber,
        account_name: response.data.account_name,
        bank_id: response.data.bank_id,
      };
    }

    throw new Error(response.message || 'Failed to verify account');
  } catch (error) {
    console.error('Error verifying bank account:', error);
    
    // Handle specific Paystack error messages
    if (error instanceof Error) {
      if (error.message.includes('Could not resolve account name')) {
        throw new Error('Invalid account number or bank. Please check your details.');
      }
      if (error.message.includes('Invalid account number')) {
        throw new Error('Invalid account number format. Please enter a valid 10-digit account number.');
      }
    }
    
    throw new Error('Failed to verify bank account. Please check your details and try again.');
  }
}

// Create a Paystack subaccount
export async function createSubaccount(data: SubaccountData): Promise<PaystackSubaccount> {
  try {
    const response = await paystackRequest<PaystackSubaccount>('/subaccount', {
      method: 'POST',
      body: JSON.stringify({
        business_name: data.business_name,
        settlement_bank: data.settlement_bank,
        account_number: data.account_number,
        percentage_charge: data.percentage_charge,
        description: data.description || `Subaccount for ${data.business_name}`,
        primary_contact_email: data.primary_contact_email,
        primary_contact_name: data.primary_contact_name,
        primary_contact_phone: data.primary_contact_phone,
        metadata: data.metadata || {},
      }),
    });

    if (response.status && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to create subaccount');
  } catch (error) {
    console.error('Error creating subaccount:', error);
    throw new Error('Failed to create payment account. Please try again.');
  }
}

// Update a Paystack subaccount
export async function updateSubaccount(
  subaccountCode: string,
  data: Partial<SubaccountData>
): Promise<PaystackSubaccount> {
  try {
    const response = await paystackRequest<PaystackSubaccount>(
      `/subaccount/${subaccountCode}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    if (response.status && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update subaccount');
  } catch (error) {
    console.error('Error updating subaccount:', error);
    throw new Error('Failed to update payment account. Please try again.');
  }
}

// Initialize payment with Paystack
export async function initializePayment(data: PaymentInitialization): Promise<{
  authorization_url: string;
  access_code: string;
  reference: string;
}> {
  try {
    const response = await paystackRequest<{
      authorization_url: string;
      access_code: string;
      reference: string;
    }>('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        amount: Math.round(data.amount), // Ensure amount is an integer (kobo)
      }),
    });

    if (response.status && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to initialize payment');
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw new Error('Failed to initialize payment. Please try again.');
  }
}

// Verify payment transaction
export async function verifyPayment(reference: string): Promise<{
  status: string;
  amount: number;
  currency: string;
  reference: string;
  gateway_response: string;
  paid_at: string;
  metadata: Record<string, any>;
}> {
  try {
    const response = await paystackRequest<{
      status: string;
      amount: number;
      currency: string;
      reference: string;
      gateway_response: string;
      paid_at: string;
      metadata: Record<string, any>;
    }>(`/transaction/verify/${reference}`, {
      method: 'GET',
    });

    if (response.status && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to verify payment');
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment. Please try again.');
  }
}

// Calculate amount in kobo (Paystack uses kobo for NGN)
export function convertToKobo(amount: number): number {
  return Math.round(amount * 100);
}

// Calculate amount from kobo to naira
export function convertFromKobo(amount: number): number {
  return amount / 100;
}

// Generate unique payment reference
export function generatePaymentReference(prefix: string = 'FB'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

// Format Nigerian Naira currency
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

// Export Paystack public key for frontend usage
export const PAYSTACK_PUBLIC_KEY_EXPORT = PAYSTACK_PUBLIC_KEY;