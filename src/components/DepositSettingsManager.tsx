import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  PieChart,
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatNaira } from '@/services/paystackService';

interface DepositSettings {
  require_deposit: boolean;
  deposit_type: 'percentage' | 'fixed';
  deposit_percentage: number;
  deposit_fixed_amount: number;
  deposit_policy: string;
}

interface DepositAnalytics {
  totalDepositsCollected: number;
  averageDepositAmount: number;
  depositConversionRate: number;
  monthlyDepositTrend: number;
  cancelledAppointments: number;
  refundedDeposits: number;
}

export const DepositSettingsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [depositSettings, setDepositSettings] = useState<DepositSettings>({
    require_deposit: false,
    deposit_type: 'percentage',
    deposit_percentage: 25,
    deposit_fixed_amount: 5000,
    deposit_policy: "Deposits are required to secure your appointment and are non-refundable if cancelled within 24 hours."
  });
  
  const [analytics, setAnalytics] = useState<DepositAnalytics>({
    totalDepositsCollected: 0,
    averageDepositAmount: 0,
    depositConversionRate: 0,
    monthlyDepositTrend: 0,
    cancelledAppointments: 0,
    refundedDeposits: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDepositSettings(),
        loadDepositAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading deposit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deposit settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepositSettings = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('deposit_settings')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    if (data?.deposit_settings) {
      setDepositSettings(data.deposit_settings);
    }
  };

  const loadDepositAnalytics = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(startOfMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get deposit transactions
    const { data: deposits } = await supabase
      .from('payment_transactions')
      .select('amount, created_at, status')
      .eq('professional_id', user.id)
      .eq('transaction_type', 'deposit');

    // Get appointment data
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, status, deposit_required, deposit_paid, deposit_amount')
      .eq('professional_id', user.id);

    // Calculate analytics
    const successfulDeposits = deposits?.filter(d => d.status === 'success') || [];
    const totalDepositsCollected = successfulDeposits.reduce((sum, d) => sum + d.amount, 0);
    const averageDepositAmount = successfulDeposits.length > 0 
      ? totalDepositsCollected / successfulDeposits.length 
      : 0;

    // This month vs last month deposits
    const thisMonthDeposits = successfulDeposits.filter(d => 
      new Date(d.created_at) >= startOfMonth
    );
    const lastMonthDeposits = successfulDeposits.filter(d => {
      const date = new Date(d.created_at);
      return date >= lastMonth && date < startOfMonth;
    });

    const monthlyDepositTrend = lastMonthDeposits.length > 0
      ? ((thisMonthDeposits.length - lastMonthDeposits.length) / lastMonthDeposits.length) * 100
      : 0;

    // Conversion rate (appointments requiring deposits that were paid)
    const depositRequiredAppointments = appointments?.filter(a => a.deposit_required) || [];
    const depositPaidAppointments = depositRequiredAppointments.filter(a => a.deposit_paid);
    const depositConversionRate = depositRequiredAppointments.length > 0
      ? (depositPaidAppointments.length / depositRequiredAppointments.length) * 100
      : 0;

    // Cancelled appointments and refunded deposits
    const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
    const refundedDeposits = deposits?.filter(d => d.status === 'refunded').length || 0;

    setAnalytics({
      totalDepositsCollected,
      averageDepositAmount,
      depositConversionRate,
      monthlyDepositTrend,
      cancelledAppointments,
      refundedDeposits,
    });
  };

  const saveDepositSettings = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          deposit_settings: depositSettings,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deposit settings have been saved successfully',
      });
    } catch (error) {
      console.error('Error saving deposit settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save deposit settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateSampleDeposit = (servicePrice: number) => {
    if (depositSettings.deposit_type === 'percentage') {
      return (servicePrice * depositSettings.deposit_percentage) / 100;
    }
    return depositSettings.deposit_fixed_amount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mr-2" />
        <span>Loading deposit settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deposit Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deposits Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNaira(analytics.totalDepositsCollected)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Deposit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNaira(analytics.averageDepositAmount)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.depositConversionRate.toFixed(1)}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Growth</p>
                <p className={`text-2xl font-bold ${
                  analytics.monthlyDepositTrend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.monthlyDepositTrend >= 0 ? '+' : ''}{analytics.monthlyDepositTrend.toFixed(1)}%
                </p>
              </div>
              <Calendar className="w-8 h-8 text-gray-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Settings Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Deposit Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Deposits */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">Require Deposits</h3>
              <p className="text-sm text-gray-600">
                Require clients to pay a deposit to secure their appointments
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
            <div className="space-y-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              {/* Deposit Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Deposit Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-white cursor-pointer">
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
                    <div>
                      <span className="font-medium">Percentage</span>
                      <p className="text-sm text-gray-600">% of service price</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-white cursor-pointer">
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
                    <div>
                      <span className="font-medium">Fixed Amount</span>
                      <p className="text-sm text-gray-600">Same for all services</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Deposit Amount Configuration */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  {depositSettings.deposit_type === "percentage" ? "Deposit Percentage" : "Fixed Deposit Amount"}
                </Label>
                <div className="relative">
                  {depositSettings.deposit_type === "percentage" ? (
                    <>
                      <Input
                        type="number"
                        value={depositSettings.deposit_percentage}
                        onChange={(e) => setDepositSettings(prev => ({ 
                          ...prev, 
                          deposit_percentage: Number(e.target.value) 
                        }))}
                        min="1"
                        max="100"
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Recommended: 20-50% of service price
                      </p>
                    </>
                  ) : (
                    <>
                      <Input
                        type="number"
                        value={depositSettings.deposit_fixed_amount}
                        onChange={(e) => setDepositSettings(prev => ({ 
                          ...prev, 
                          deposit_fixed_amount: Number(e.target.value) 
                        }))}
                        min="1000"
                        step="500"
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Recommended: ₦2,000 - ₦10,000 depending on your services
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Deposit Examples */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Deposit Examples
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[10000, 25000, 50000].map((price) => (
                    <div key={price} className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">Service: {formatNaira(price)}</p>
                      <p className="font-medium text-blue-800">
                        Deposit: {formatNaira(calculateSampleDeposit(price))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposit Policy */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Deposit Policy</Label>
                <Textarea
                  value={depositSettings.deposit_policy}
                  onChange={(e) => setDepositSettings(prev => ({ 
                    ...prev, 
                    deposit_policy: e.target.value 
                  }))}
                  rows={4}
                  placeholder="Explain your deposit policy to clients..."
                  className="resize-none"
                />
                <p className="text-sm text-gray-600">
                  This message will be shown to clients when booking appointments
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveDepositSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Deposit Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {depositSettings.require_deposit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Deposit Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Deposit Payment Rate</span>
                  <Badge className={`${
                    analytics.depositConversionRate >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : analytics.depositConversionRate >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {analytics.depositConversionRate.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled Appointments</span>
                  <span className="font-medium">{analytics.cancelledAppointments}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Refunded Deposits</span>
                  <span className="font-medium">{analytics.refundedDeposits}</span>
                </div>
              </div>

              <div className="space-y-4">
                {analytics.depositConversionRate < 70 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Consider lowering your deposit amount or adjusting your policy to improve booking conversion rates.
                    </AlertDescription>
                  </Alert>
                )}
                
                {analytics.depositConversionRate >= 80 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Great job! Your deposit policy is working well with high conversion rates.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};