import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bank, 
  BankAccountVerification,
  fetchBanks, 
  verifyBankAccount, 
  createSubaccount,
  formatNaira
} from "@/services/paystackService";
import { 
  CreditCard, 
  DollarSign, 
  Percent, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  Loader2,
  Save
} from "lucide-react";

interface DepositSettings {
  require_deposit: boolean;
  deposit_type: 'percentage' | 'fixed';
  deposit_percentage: number;
  deposit_fixed_amount: number;
  deposit_policy: string;
}

const PaymentSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Bank account states
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  
  // Current bank account info
  const [currentBankAccount, setCurrentBankAccount] = useState<{
    bank_name: string | null;
    bank_code: string | null;
    account_number: string | null;
    account_name: string | null;
    account_verified: boolean;
    paystack_subaccount_code: string | null;
  } | null>(null);

  // Deposit settings state
  const [depositSettings, setDepositSettings] = useState<DepositSettings>({
    require_deposit: false,
    deposit_type: 'percentage',
    deposit_percentage: 25,
    deposit_fixed_amount: 5000,
    deposit_policy: "Deposits are required to secure your appointment and are non-refundable if cancelled within 24 hours."
  });

  // Load banks and current settings on component mount
  useEffect(() => {
    loadBanks();
    loadCurrentSettings();
  }, []);

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      const banksData = await fetchBanks();
      setBanks(banksData);
    } catch (error) {
      console.error('Error loading banks:', error);
      toast({
        title: "Error",
        description: "Failed to load banks. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoadingBanks(false);
    }
  };

  const loadCurrentSettings = async () => {
    if (!user?.id) return;

    try {
      // Load bank account info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('bank_name, bank_code, account_number, account_name, account_verified, paystack_subaccount_code, deposit_settings')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      if (profileData) {
        setCurrentBankAccount({
          bank_name: profileData.bank_name,
          bank_code: profileData.bank_code,
          account_number: profileData.account_number,
          account_name: profileData.account_name,
          account_verified: profileData.account_verified || false,
          paystack_subaccount_code: profileData.paystack_subaccount_code,
        });

        // Set form values if account exists
        if (profileData.account_number) {
          setAccountNumber(profileData.account_number);
          setAccountName(profileData.account_name || "");
          setIsVerified(profileData.account_verified || false);
          
          // Find and set the selected bank
          if (profileData.bank_code && banks.length > 0) {
            const bank = banks.find(b => b.code === profileData.bank_code);
            if (bank) {
              setSelectedBank(bank);
            }
          }
        }

        // Load deposit settings
        if (profileData.deposit_settings) {
          setDepositSettings(profileData.deposit_settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Update banks when they're loaded and we have existing bank code
  useEffect(() => {
    if (banks.length > 0 && currentBankAccount?.bank_code && !selectedBank) {
      const bank = banks.find(b => b.code === currentBankAccount.bank_code);
      if (bank) {
        setSelectedBank(bank);
      }
    }
  }, [banks, currentBankAccount, selectedBank]);

  const handleVerifyAccount = async () => {
    if (!selectedBank || !accountNumber.trim()) {
      toast({
        title: "Error",
        description: "Please select a bank and enter account number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const verification = await verifyBankAccount(accountNumber.trim(), selectedBank.code);
      
      setAccountName(verification.account_name);
      setIsVerified(true);
      
      toast({
        title: "Success",
        description: `Account verified: ${verification.account_name}`,
      });
    } catch (error) {
      console.error('Verification error:', error);
      setIsVerified(false);
      setAccountName("");
      
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify account",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      
      let subaccountCode = currentBankAccount?.paystack_subaccount_code;
      
      // Create subaccount if bank account is verified and no subaccount exists
      if (isVerified && selectedBank && accountNumber && accountName && !subaccountCode) {
        try {
          const subaccount = await createSubaccount({
            business_name: user.user_metadata?.business_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'BotglamBeauty Professional',
            settlement_bank: selectedBank.code,
            account_number: accountNumber.replace(/\s+/g, ''),
            percentage_charge: 2.5, // Platform fee percentage
            description: `Subaccount for beauty professional`,
            primary_contact_email: user.email,
            primary_contact_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Professional',
            primary_contact_phone: user.user_metadata?.phone || '',
            metadata: {
              user_id: user.id,
              platform: 'BotglamBeauty'
            }
          });
          
          subaccountCode = subaccount.subaccount_code;
          
          toast({
            title: "Success",
            description: "Payment account created successfully!",
          });
        } catch (subaccountError) {
          console.error('Subaccount creation error:', subaccountError);
          toast({
            title: "Warning",
            description: "Bank account saved but payment setup incomplete. Please try again later.",
            variant: "destructive",
          });
        }
      }
      
      // Update database with bank account and deposit settings
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bank_name: selectedBank?.name || null,
          bank_code: selectedBank?.code || null,
          account_number: isVerified ? accountNumber.replace(/\s+/g, '') : null,
          account_name: isVerified ? accountName : null,
          account_verified: isVerified,
          paystack_subaccount_code: subaccountCode,
          paystack_subaccount_id: null, // Will be updated by webhook if needed
          bank_setup_completed: isVerified,
          deposit_settings: depositSettings,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Reload current settings
      await loadCurrentSettings();
      
      toast({
        title: "Success",
        description: "Payment settings saved successfully!",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setIsVerified(false);
  };

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Payment Settings
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Set up your bank account for receiving payments and configure deposit requirements
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Bank Account Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  <span>Bank Account Setup</span>
                </CardTitle>
                <CardDescription>
                  Connect your Nigerian bank account to receive payments from clients.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Current Bank Account Status */}
                {currentBankAccount?.account_verified && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">Bank Account Verified</h3>
                        <p className="text-sm text-green-700 mt-1">
                          <strong>{currentBankAccount.account_name}</strong><br />
                          {currentBankAccount.bank_name} • {currentBankAccount.account_number}
                        </p>
                        {currentBankAccount.paystack_subaccount_code && (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            Payment Ready
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="text-green-700 border-green-300 hover:bg-green-100"
                      >
                        Update Account
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bank Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Bank</Label>
                    {loadingBanks ? (
                      <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading banks...</span>
                      </div>
                    ) : (
                      <select
                        value={selectedBank?.code || ''}
                        onChange={(e) => {
                          const bank = banks.find(b => b.code === e.target.value);
                          setSelectedBank(bank || null);
                          setIsVerified(false);
                          setAccountName("");
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={currentBankAccount?.account_verified}
                      >
                        <option value="">Choose your bank...</option>
                        {banks.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            setAccountNumber(value);
                            setIsVerified(false);
                            setAccountName("");
                          }
                        }}
                        placeholder="Enter 10-digit account number"
                        className="pr-12"
                        maxLength={10}
                        disabled={currentBankAccount?.account_verified}
                      />
                      {isVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{accountNumber.length}/10 digits</p>
                  </div>
                </div>

                {/* Account Verification */}
                {selectedBank && accountNumber.length === 10 && !currentBankAccount?.account_verified && (
                  <div className="space-y-3">
                    <Button
                      onClick={handleVerifyAccount}
                      disabled={isVerifying}
                      className="w-full sm:w-auto"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Account
                        </>
                      )}
                    </Button>

                    {isVerified && accountName && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">Account Verified</p>
                            <p className="text-sm text-green-700">{accountName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deposit Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span>Deposit Requirements</span>
                </CardTitle>
                <CardDescription>
                  Configure deposit requirements to secure appointments from clients.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="font-medium text-gray-900">Require Deposits</h3>
                    <p className="text-sm text-gray-500">
                      Require clients to pay a deposit when booking to secure their appointment
                    </p>
                  </div>
                  <Switch
                    checked={depositSettings.require_deposit}
                    onCheckedChange={(checked) => 
                      setDepositSettings(prev => ({ ...prev, require_deposit: checked }))
                    }
                  />
                </div>

                {depositSettings.require_deposit && (
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Deposit Type</Label>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="percentage"
                              checked={depositSettings.deposit_type === "percentage"}
                              onChange={(e) => setDepositSettings(prev => ({ 
                                ...prev, 
                                deposit_type: e.target.value as "percentage" | "fixed" 
                              }))}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">Percentage of service price</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="fixed"
                              checked={depositSettings.deposit_type === "fixed"}
                              onChange={(e) => setDepositSettings(prev => ({ 
                                ...prev, 
                                deposit_type: e.target.value as "percentage" | "fixed" 
                              }))}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">Fixed amount</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {depositSettings.deposit_type === "percentage" ? "Percentage (%)" : "Amount (₦)"}
                        </Label>
                        <div className="relative">
                          {depositSettings.deposit_type === "percentage" ? (
                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          ) : (
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          )}
                          <Input
                            type="number"
                            value={depositSettings.deposit_type === "percentage" 
                              ? depositSettings.deposit_percentage 
                              : depositSettings.deposit_fixed_amount
                            }
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (depositSettings.deposit_type === "percentage") {
                                setDepositSettings(prev => ({ ...prev, deposit_percentage: value }));
                              } else {
                                setDepositSettings(prev => ({ ...prev, deposit_fixed_amount: value }));
                              }
                            }}
                            placeholder={depositSettings.deposit_type === "percentage" ? "25" : "5000"}
                            className="pl-10"
                            min="0"
                            max={depositSettings.deposit_type === "percentage" ? "100" : undefined}
                          />
                        </div>
                        {depositSettings.deposit_type === "percentage" && (
                          <p className="text-xs text-gray-500">
                            Example: For a ₦20,000 service, {depositSettings.deposit_percentage}% = {formatNaira(20000 * depositSettings.deposit_percentage / 100)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Deposit Policy</Label>
                      <textarea
                        value={depositSettings.deposit_policy}
                        onChange={(e) => setDepositSettings(prev => ({ 
                          ...prev, 
                          deposit_policy: e.target.value 
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="Explain your deposit policy to clients..."
                      />
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium">How deposits work:</p>
                          <ul className="mt-1 space-y-1 list-disc list-inside">
                            <li>Clients pay the deposit when booking</li>
                            <li>Appointment is confirmed once deposit is received</li>
                            <li>Remaining balance is paid at the appointment</li>
                            <li>Funds are automatically transferred to your bank account</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Payment Settings
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  loadCurrentSettings();
                  resetForm();
                }}
                className="w-full sm:w-auto"
              >
                Cancel Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;