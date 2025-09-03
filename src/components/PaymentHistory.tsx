import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  DollarSign,
  Clock,
  User,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatNaira } from '@/services/paystackService';

interface PaymentTransaction {
  id: string;
  appointment_id: string | null;
  user_id: string;
  professional_id: string;
  service_id: string | null;
  amount: number;
  currency: string;
  transaction_type: string;
  paystack_reference: string;
  status: string;
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  metadata: any;
  appointment?: {
    id: string;
    client_name: string;
    service: {
      name: string;
    } | null;
  } | null;
  service?: {
    id: string;
    name: string;
  } | null;
  professional?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
  } | null;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
  } | null;
}

interface PaymentHistoryProps {
  userId?: string;
  appointmentId?: string;
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export const PaymentHistory = ({ 
  userId, 
  appointmentId, 
  className = '', 
  showTitle = true,
  compact = false 
}: PaymentHistoryProps) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [userId, appointmentId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('payment_transactions')
        .select(`
          *,
          appointment:appointments(id, client_name, service:services(name)),
          service:services(id, name),
          professional:profiles!payment_transactions_professional_id_fkey(id, first_name, last_name, business_name),
          user:profiles!payment_transactions_user_id_fkey(id, first_name, last_name, full_name)
        `)
        .order('created_at', { ascending: false });

      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId);
      } else if (userId) {
        query = query.or(`user_id.eq.${userId},professional_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching payment transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, isIncoming: boolean) => {
    const iconProps = "w-4 h-4";
    
    switch (type) {
      case 'deposit':
        return isIncoming ? 
          <ArrowDownLeft className={`${iconProps} text-green-600`} /> :
          <ArrowUpRight className={`${iconProps} text-blue-600`} />;
      case 'full_payment':
        return isIncoming ? 
          <ArrowDownLeft className={`${iconProps} text-green-600`} /> :
          <ArrowUpRight className={`${iconProps} text-blue-600`} />;
      case 'refund':
        return isIncoming ? 
          <ArrowDownLeft className={`${iconProps} text-yellow-600`} /> :
          <ArrowUpRight className={`${iconProps} text-red-600`} />;
      default:
        return <CreditCard className={`${iconProps} text-gray-600`} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      refunded: { color: 'bg-blue-100 text-blue-800', icon: ArrowDownLeft },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTransactionDescription = (transaction: PaymentTransaction, isUserTransaction: boolean) => {
    const serviceName = transaction.appointment?.service?.name || transaction.service?.name || 'Service';
    const clientName = transaction.appointment?.client_name || 'Client';
    const professionalName = transaction.professional?.business_name || 
      (transaction.professional?.first_name && transaction.professional?.last_name 
        ? `${transaction.professional.first_name} ${transaction.professional.last_name}`
        : 'Professional');

    if (isUserTransaction) {
      // User made this payment
      return `${transaction.transaction_type.replace('_', ' ')} for ${serviceName} with ${professionalName}`;
    } else {
      // User received this payment
      return `${transaction.transaction_type.replace('_', ' ')} from ${clientName} for ${serviceName}`;
    }
  };

  const renderTransactionCard = (transaction: PaymentTransaction) => {
    const isUserTransaction = transaction.user_id === userId;
    const isIncoming = !isUserTransaction;

    return (
      <Card key={transaction.id} className={`${compact ? 'mb-2' : 'mb-4'} hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => setSelectedTransaction(transaction)}>
        <CardContent className={compact ? 'p-4' : 'p-6'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTransactionIcon(transaction.transaction_type, isIncoming)}
              <div>
                <p className={`font-medium ${compact ? 'text-sm' : 'text-base'}`}>
                  {getTransactionDescription(transaction, isUserTransaction)}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Clock className="w-3 h-3" />
                  {transaction.paid_at 
                    ? format(new Date(transaction.paid_at), 'MMM dd, yyyy h:mm a')
                    : format(new Date(transaction.created_at), 'MMM dd, yyyy h:mm a')
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-bold ${compact ? 'text-base' : 'text-lg'} ${
                  isIncoming ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {isIncoming ? '+' : ''}{formatNaira(transaction.amount)}
                </p>
                {getStatusBadge(transaction.status)}
              </div>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Transaction Details</h2>
              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                Close
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Transaction Information</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Amount:</span> <span className="font-bold">{formatNaira(selectedTransaction.amount)}</span></p>
                  <p><span className="text-gray-600">Type:</span> <span className="capitalize">{selectedTransaction.transaction_type.replace('_', ' ')}</span></p>
                  <p><span className="text-gray-600">Status:</span> {getStatusBadge(selectedTransaction.status)}</p>
                  <p><span className="text-gray-600">Reference:</span> <span className="font-mono text-sm">{selectedTransaction.paystack_reference}</span></p>
                  <p><span className="text-gray-600">Currency:</span> {selectedTransaction.currency}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="space-y-2">
                  {selectedTransaction.paid_at && (
                    <p><span className="text-gray-600">Paid At:</span> {format(new Date(selectedTransaction.paid_at), 'MMM dd, yyyy h:mm a')}</p>
                  )}
                  <p><span className="text-gray-600">Created At:</span> {format(new Date(selectedTransaction.created_at), 'MMM dd, yyyy h:mm a')}</p>
                  {selectedTransaction.gateway_response && (
                    <p><span className="text-gray-600">Gateway Response:</span> {selectedTransaction.gateway_response}</p>
                  )}
                </div>
              </div>
            </div>

            {selectedTransaction.appointment && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><span className="text-gray-600">Client:</span> {selectedTransaction.appointment.client_name}</p>
                  {selectedTransaction.appointment.service && (
                    <p><span className="text-gray-600">Service:</span> {selectedTransaction.appointment.service.name}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-8'} ${className}`}>
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payment History
          </h2>
          <Button onClick={fetchTransactions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {transactions.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No payment transactions found.
          </AlertDescription>
        </Alert>
      ) : (
        <div>
          {transactions.map(renderTransactionCard)}
        </div>
      )}

      {selectedTransaction && renderTransactionDetails()}
    </div>
  );
};