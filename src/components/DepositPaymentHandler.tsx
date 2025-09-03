import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { verifyPayment, formatNaira } from '@/services/paystackService';

interface PaymentResult {
  status: 'success' | 'failed' | 'pending';
  message: string;
  appointment?: any;
  amount?: number;
}

export const DepositPaymentHandler = () => {
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref'); // Paystack returns this
        
        if (!reference && !trxref) {
          setPaymentResult({
            status: 'failed',
            message: 'No payment reference found. Please try booking again.',
          });
          setIsProcessing(false);
          return;
        }

        const paymentRef = reference || trxref;
        if (!paymentRef) {
          setPaymentResult({
            status: 'failed',
            message: 'Invalid payment reference. Please try booking again.',
          });
          setIsProcessing(false);
          return;
        }

        // Get stored booking data
        const bookingDataStr = sessionStorage.getItem('booking_payment');
        if (!bookingDataStr) {
          setPaymentResult({
            status: 'failed',
            message: 'Booking session expired. Please try booking again.',
          });
          setIsProcessing(false);
          return;
        }

        const bookingData = JSON.parse(bookingDataStr);
        
        // Verify payment with Paystack
        const paymentVerification = await verifyPayment(paymentRef);
        
        if (paymentVerification.status === 'success') {
          // Payment successful, create appointment and transaction records
          const { appointment_data } = bookingData;
          
          // Create the appointment
          const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert({
              ...appointment_data,
              status: 'confirmed',
              deposit_paid: true,
              payment_status: 'partial',
              deposit_paid_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (appointmentError) throw appointmentError;

          // Create payment transaction record
          const { error: transactionError } = await supabase
            .from('payment_transactions')
            .insert({
              appointment_id: appointment.id,
              user_id: appointment_data.user_id || appointment.user_id,
              professional_id: appointment_data.professional_id,
              service_id: appointment_data.service_id,
              amount: paymentVerification.amount / 100, // Convert from kobo to naira
              currency: paymentVerification.currency,
              transaction_type: 'deposit',
              paystack_reference: paymentRef,
              status: 'success',
              gateway_response: paymentVerification.gateway_response,
              paid_at: paymentVerification.paid_at,
              metadata: paymentVerification.metadata,
            });

          if (transactionError) {
            console.error('Error creating transaction record:', transactionError);
            // Don't fail the booking for this
          }

          // Send confirmation emails
          try {
            // Get professional profile for email
            const { data: professionalProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name, full_name, business_name, email')
              .eq('id', appointment_data.professional_id)
              .single();

            const professionalName = professionalProfile?.first_name && professionalProfile?.last_name
              ? `${professionalProfile.first_name} ${professionalProfile.last_name}`
              : professionalProfile?.full_name || professionalProfile?.business_name || 'Beauty Professional';

            // Send client confirmation
            await supabase.functions.invoke('send-appointment-email', {
              body: {
                type: 'deposit_confirmation',
                appointmentId: appointment.id,
                recipientEmail: appointment_data.client_email,
                recipientName: appointment_data.client_name,
                professionalName: professionalName,
                serviceName: appointment.service?.name,
                appointmentDate: appointment_data.start_time,
                depositAmount: paymentVerification.amount / 100,
                totalAmount: appointment_data.total_amount,
                remainingBalance: appointment_data.total_amount - (paymentVerification.amount / 100),
              }
            });

            // Send professional notification
            if (professionalProfile?.email) {
              await supabase.functions.invoke('send-appointment-email', {
                body: {
                  type: 'deposit_received',
                  appointmentId: appointment.id,
                  recipientEmail: professionalProfile.email,
                  recipientName: professionalName,
                  clientName: appointment_data.client_name,
                  clientEmail: appointment_data.client_email,
                  serviceName: appointment.service?.name,
                  appointmentDate: appointment_data.start_time,
                  depositAmount: paymentVerification.amount / 100,
                  totalAmount: appointment_data.total_amount,
                }
              });
            }
          } catch (emailError) {
            console.error('Error sending confirmation emails:', emailError);
          }

          setPaymentResult({
            status: 'success',
            message: 'Your deposit has been paid successfully and your appointment is confirmed!',
            appointment,
            amount: paymentVerification.amount / 100,
          });

          // Clear session storage
          sessionStorage.removeItem('booking_payment');

          // Show success toast
          toast({
            title: "Payment Successful! 🎉",
            description: "Your deposit has been paid and appointment confirmed.",
          });

        } else {
          setPaymentResult({
            status: 'failed',
            message: 'Payment verification failed. If you were charged, please contact support.',
          });
        }

      } catch (error: any) {
        console.error('Error processing payment:', error);
        setPaymentResult({
          status: 'failed',
          message: error.message || 'An error occurred while processing your payment. Please contact support if you were charged.',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, toast]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleViewAppointments = () => {
    navigate('/appointments');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600 text-center">Please wait while we verify your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {paymentResult?.status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {paymentResult?.status === 'failed' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
            {paymentResult?.status === 'pending' && (
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {paymentResult?.status === 'success' && 'Payment Successful!'}
            {paymentResult?.status === 'failed' && 'Payment Failed'}
            {paymentResult?.status === 'pending' && 'Payment Pending'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className={`${
            paymentResult?.status === 'success' ? 'border-green-200 bg-green-50' :
            paymentResult?.status === 'failed' ? 'border-red-200 bg-red-50' :
            'border-yellow-200 bg-yellow-50'
          }`}>
            <AlertDescription className="text-center text-lg">
              {paymentResult?.message}
            </AlertDescription>
          </Alert>

          {paymentResult?.status === 'success' && paymentResult.appointment && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Booking Confirmation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{paymentResult.appointment.service?.name || 'Service'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">
                    {new Date(paymentResult.appointment.start_time).toLocaleDateString()} at{' '}
                    {new Date(paymentResult.appointment.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Deposit Paid</p>
                  <p className="font-medium text-green-600">
                    {formatNaira(paymentResult.amount || 0)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Remaining Balance</p>
                  <p className="font-medium">
                    {formatNaira((paymentResult.appointment.total_amount || 0) - (paymentResult.amount || 0))}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Important:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• You will receive a confirmation email shortly</li>
                  <li>• The remaining balance is due at the time of service</li>
                  <li>• Please arrive 10 minutes before your appointment time</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleReturnHome} variant="outline" className="w-full sm:w-auto">
              Return to Home
            </Button>
            {paymentResult?.status === 'success' && (
              <Button onClick={handleViewAppointments} className="w-full sm:w-auto">
                View My Appointments
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};