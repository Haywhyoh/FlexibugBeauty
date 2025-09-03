import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatNaira } from '@/services/paystackService';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  notes: string | null;
  deposit_required: boolean;
  deposit_amount: number | null;
  deposit_paid: boolean;
  payment_status: string;
  total_amount: number | null;
  payment_reference: string | null;
  service: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
  professional: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    avatar_url: string | null;
  } | null;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  paystack_reference: string;
  paid_at: string | null;
  created_at: string;
}

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          client_name,
          client_email,
          client_phone,
          notes,
          deposit_required,
          deposit_amount,
          deposit_paid,
          payment_status,
          total_amount,
          payment_reference,
          service:services(id, name, price, duration_minutes),
          professional:profiles!appointments_professional_id_fkey(id, first_name, last_name, business_name, avatar_url),
          user:profiles!appointments_user_id_fkey(id, first_name, last_name, full_name, avatar_url)
        `)
        .or(`user_id.eq.${user.id},professional_id.eq.${user.id}`)
        .order('start_time', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment transactions',
        variant: 'destructive',
      });
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Refresh appointments
      await fetchAppointments();
      
      toast({
        title: 'Success',
        description: `Appointment ${newStatus} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
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

  const getPaymentStatusBadge = (paymentStatus: string, depositPaid: boolean) => {
    if (paymentStatus === 'paid') {
      return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
    }
    if (paymentStatus === 'partial' && depositPaid) {
      return <Badge className="bg-yellow-100 text-yellow-800">Deposit Paid</Badge>;
    }
    if (paymentStatus === 'refunded') {
      return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Pending Payment</Badge>;
  };

  const filterAppointments = (type: string) => {
    const now = new Date();
    
    switch (type) {
      case 'upcoming':
        return appointments.filter(apt => 
          new Date(apt.start_time) > now && apt.status === 'confirmed'
        );
      case 'past':
        return appointments.filter(apt => 
          new Date(apt.start_time) <= now
        );
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled');
      case 'pending':
        return appointments.filter(apt => apt.status === 'pending');
      default:
        return appointments;
    }
  };

  const getDisplayName = (appointment: Appointment) => {
    if (appointment.professional?.id === user?.id) {
      // User is the professional, show client name
      return appointment.client_name;
    } else {
      // User is the client, show professional name
      const professional = appointment.professional;
      if (professional?.first_name && professional?.last_name) {
        return `${professional.first_name} ${professional.last_name}`;
      }
      return professional?.business_name || 'Professional';
    }
  };

  const getDisplayRole = (appointment: Appointment) => {
    return appointment.professional?.id === user?.id ? 'Client' : 'Professional';
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={appointment.professional?.avatar_url || appointment.user?.avatar_url || undefined} />
              <AvatarFallback>
                {getDisplayName(appointment).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{getDisplayName(appointment)}</h3>
              <p className="text-sm text-gray-600">{getDisplayRole(appointment)}</p>
            </div>
          </div>

          {/* Service and Time Info */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-purple-800">{appointment.service?.name}</h4>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(appointment.start_time), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {format(new Date(appointment.start_time), 'h:mm a')} - {format(new Date(appointment.end_time), 'h:mm a')}
                </div>
              </div>
              
              <div className="space-y-2">
                {getStatusBadge(appointment.status)}
                {appointment.deposit_required && (
                  getPaymentStatusBadge(appointment.payment_status, appointment.deposit_paid)
                )}
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="font-bold text-lg text-purple-600">
                {formatNaira(appointment.total_amount || appointment.service?.price || 0)}
              </p>
              {appointment.deposit_required && appointment.deposit_amount && (
                <p className="text-sm text-gray-600">
                  Deposit: {formatNaira(appointment.deposit_amount)}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  fetchTransactions(appointment.id);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
              
              {appointment.professional?.id === user?.id && appointment.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                  >
                    Decline
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appointment Details</h2>
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>{format(new Date(selectedAppointment.start_time), 'EEEE, MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>
                      {format(new Date(selectedAppointment.start_time), 'h:mm a')} - 
                      {format(new Date(selectedAppointment.end_time), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span>{selectedAppointment.service?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span>{formatNaira(selectedAppointment.total_amount || selectedAppointment.service?.price || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    Status: {getStatusBadge(selectedAppointment.status)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span>{selectedAppointment.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span>{selectedAppointment.client_email}</span>
                  </div>
                  {selectedAppointment.client_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span>{selectedAppointment.client_phone}</span>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                      <span className="text-sm">{selectedAppointment.notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Information */}
            {selectedAppointment.deposit_required && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatNaira(selectedAppointment.total_amount || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Deposit Required</p>
                      <p className="text-xl font-bold text-yellow-600">
                        {formatNaira(selectedAppointment.deposit_amount || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Remaining Balance</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatNaira((selectedAppointment.total_amount || 0) - (selectedAppointment.deposit_amount || 0))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    Payment Status: {getPaymentStatusBadge(selectedAppointment.payment_status, selectedAppointment.deposit_paid)}
                  </div>

                  {/* Transaction History */}
                  {transactions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Transaction History</h4>
                      <div className="space-y-2">
                        {transactions.map((transaction) => (
                          <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{transaction.transaction_type}</p>
                              <p className="text-sm text-gray-600">
                                Ref: {transaction.paystack_reference}
                              </p>
                              {transaction.paid_at && (
                                <p className="text-sm text-gray-600">
                                  {format(new Date(transaction.paid_at), 'MMM dd, yyyy h:mm a')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatNaira(transaction.amount)}</p>
                              <Badge className={transaction.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <Button onClick={fetchAppointments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="space-y-4">
              {filterAppointments('upcoming').length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No upcoming appointments found.
                  </AlertDescription>
                </Alert>
              ) : (
                filterAppointments('upcoming').map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="space-y-4">
              {filterAppointments('past').length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No past appointments found.
                  </AlertDescription>
                </Alert>
              ) : (
                filterAppointments('past').map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="space-y-4">
              {filterAppointments('pending').length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No pending appointments found.
                  </AlertDescription>
                </Alert>
              ) : (
                filterAppointments('pending').map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="space-y-4">
              {filterAppointments('cancelled').length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No cancelled appointments found.
                  </AlertDescription>
                </Alert>
              ) : (
                filterAppointments('cancelled').map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedAppointment && renderAppointmentDetails()}
      </div>
    </div>
  );
};