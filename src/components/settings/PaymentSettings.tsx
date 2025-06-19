
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, DollarSign, Percent, Clock } from "lucide-react";

const PaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState({
    stripe: { connected: true, email: "sarah@beautifullashes.com" },
    paypal: { connected: false, email: "" },
    square: { connected: false, merchantId: "" }
  });

  const [depositSettings, setDepositSettings] = useState({
    requireDeposit: true,
    depositType: "percentage", // "percentage" or "fixed"
    depositAmount: 25,
    depositPolicy: "Deposits are required to secure your appointment and are non-refundable if cancelled within 24 hours."
  });

  const [cancellationSettings, setCancellationSettings] = useState({
    allowCancellation: true,
    cancellationHours: 24,
    cancellationFee: 0,
    rescheduleHours: 12
  });

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Payment Settings
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Configure payment methods, deposits, and cancellation policies
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <span>Payment Methods</span>
                </CardTitle>
                <CardDescription>
                  Connect your preferred payment processors to accept online payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Stripe */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Stripe</h3>
                      {paymentMethods.stripe.connected ? (
                        <p className="text-sm text-green-600">Connected • {paymentMethods.stripe.email}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant={paymentMethods.stripe.connected ? "outline" : "default"}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {paymentMethods.stripe.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>

                {/* PayPal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">PayPal</h3>
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Connect
                  </Button>
                </div>

                {/* Square */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">□</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Square</h3>
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deposit Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <span>Deposit Requirements</span>
                </CardTitle>
                <CardDescription>
                  Set up deposit requirements to secure appointments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="font-medium text-gray-900">Require Deposits</h3>
                    <p className="text-sm text-gray-500">Require clients to pay a deposit when booking</p>
                  </div>
                  <Switch
                    checked={depositSettings.requireDeposit}
                    onCheckedChange={(checked) => 
                      setDepositSettings(prev => ({ ...prev, requireDeposit: checked }))
                    }
                  />
                </div>

                {depositSettings.requireDeposit && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Deposit Type</Label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="percentage"
                              checked={depositSettings.depositType === "percentage"}
                              onChange={(e) => setDepositSettings(prev => ({ 
                                ...prev, 
                                depositType: e.target.value as "percentage" | "fixed" 
                              }))}
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm">Percentage</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value="fixed"
                              checked={depositSettings.depositType === "fixed"}
                              onChange={(e) => setDepositSettings(prev => ({ 
                                ...prev, 
                                depositType: e.target.value as "percentage" | "fixed" 
                              }))}
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm">Fixed Amount</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {depositSettings.depositType === "percentage" ? "Percentage %" : "Amount $"}
                        </Label>
                        <div className="relative">
                          {depositSettings.depositType === "percentage" ? (
                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          ) : (
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          )}
                          <Input
                            type="number"
                            value={depositSettings.depositAmount}
                            onChange={(e) => setDepositSettings(prev => ({ 
                              ...prev, 
                              depositAmount: Number(e.target.value) 
                            }))}
                            placeholder={depositSettings.depositType === "percentage" ? "25" : "50"}
                            className="pl-10"
                            min="0"
                            max={depositSettings.depositType === "percentage" ? "100" : undefined}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Deposit Policy</Label>
                      <textarea
                        value={depositSettings.depositPolicy}
                        onChange={(e) => setDepositSettings(prev => ({ 
                          ...prev, 
                          depositPolicy: e.target.value 
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
                        rows={3}
                        placeholder="Explain your deposit policy..."
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span>Cancellation Policy</span>
                </CardTitle>
                <CardDescription>
                  Set rules for appointment cancellations and rescheduling.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="font-medium text-gray-900">Allow Cancellations</h3>
                    <p className="text-sm text-gray-500">Let clients cancel their appointments</p>
                  </div>
                  <Switch
                    checked={cancellationSettings.allowCancellation}
                    onCheckedChange={(checked) => 
                      setCancellationSettings(prev => ({ ...prev, allowCancellation: checked }))
                    }
                  />
                </div>

                {cancellationSettings.allowCancellation && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label>Cancellation Notice (hours)</Label>
                      <Input
                        type="number"
                        value={cancellationSettings.cancellationHours}
                        onChange={(e) => setCancellationSettings(prev => ({ 
                          ...prev, 
                          cancellationHours: Number(e.target.value) 
                        }))}
                        placeholder="24"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cancellation Fee ($)</Label>
                      <Input
                        type="number"
                        value={cancellationSettings.cancellationFee}
                        onChange={(e) => setCancellationSettings(prev => ({ 
                          ...prev, 
                          cancellationFee: Number(e.target.value) 
                        }))}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Reschedule Notice (hours)</Label>
                      <Input
                        type="number"
                        value={cancellationSettings.rescheduleHours}
                        onChange={(e) => setCancellationSettings(prev => ({ 
                          ...prev, 
                          rescheduleHours: Number(e.target.value) 
                        }))}
                        placeholder="12"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                Save Payment Settings
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
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
