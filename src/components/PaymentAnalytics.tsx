import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatNaira } from '@/services/paystackService';

interface PaymentMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  successRate: number;
  depositRevenue: number;
  fullPaymentRevenue: number;
  refundedAmount: number;
  pendingAmount: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  transactions: number;
  deposits: number;
  fullPayments: number;
}

interface ServiceRevenue {
  service_name: string;
  revenue: number;
  transactions: number;
  percentage: number;
}

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

export const PaymentAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    successRate: 0,
    depositRevenue: 0,
    fullPaymentRevenue: 0,
    refundedAmount: 0,
    pendingAmount: 0,
  });
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [serviceData, setServiceData] = useState<ServiceRevenue[]>([]);
  const [statusData, setStatusData] = useState<PaymentStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('6'); // months
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = subMonths(endDate, parseInt(timeRange));
      
      // Get all payment transactions
      const { data: transactions, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          appointment:appointments(
            service:services(name)
          )
        `)
        .eq('professional_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      calculateMetrics(transactions || []);
      calculateMonthlyTrends(transactions || [], startDate, endDate);
      calculateServiceBreakdown(transactions || []);
      calculateStatusDistribution(transactions || []);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (transactions: any[]) => {
    const successfulTransactions = transactions.filter(t => t.status === 'success');
    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = successfulTransactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const successRate = transactions.length > 0 ? (successfulTransactions.length / transactions.length) * 100 : 0;
    
    const depositRevenue = successfulTransactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const fullPaymentRevenue = successfulTransactions
      .filter(t => t.transaction_type === 'full_payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const refundedAmount = transactions
      .filter(t => t.status === 'refunded')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    setMetrics({
      totalRevenue,
      totalTransactions,
      averageTransaction,
      successRate,
      depositRevenue,
      fullPaymentRevenue,
      refundedAmount,
      pendingAmount,
    });
  };

  const calculateMonthlyTrends = (transactions: any[], startDate: Date, endDate: Date) => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = parseISO(t.created_at);
        return transactionDate >= monthStart && transactionDate <= monthEnd && t.status === 'success';
      });
      
      const deposits = monthTransactions.filter(t => t.transaction_type === 'deposit');
      const fullPayments = monthTransactions.filter(t => t.transaction_type === 'full_payment');
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
        transactions: monthTransactions.length,
        deposits: deposits.length,
        fullPayments: fullPayments.length,
      };
    });
    
    setMonthlyData(monthlyData);
  };

  const calculateServiceBreakdown = (transactions: any[]) => {
    const successfulTransactions = transactions.filter(t => t.status === 'success');
    const serviceMap = new Map<string, { revenue: number; count: number }>();
    
    successfulTransactions.forEach(transaction => {
      const serviceName = transaction.appointment?.service?.name || 'Unknown Service';
      const existing = serviceMap.get(serviceName) || { revenue: 0, count: 0 };
      serviceMap.set(serviceName, {
        revenue: existing.revenue + transaction.amount,
        count: existing.count + 1,
      });
    });
    
    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const serviceData = Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        service_name: name,
        revenue: data.revenue,
        transactions: data.count,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    setServiceData(serviceData);
  };

  const calculateStatusDistribution = (transactions: any[]) => {
    const statusMap = new Map<string, number>();
    
    transactions.forEach(transaction => {
      const status = transaction.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    
    const colors = {
      success: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444',
      cancelled: '#6b7280',
      refunded: '#8b5cf6',
    };
    
    const statusData = Array.from(statusMap.entries()).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status as keyof typeof colors] || '#6b7280',
    }));
    
    setStatusData(statusData);
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', formatNaira(metrics.totalRevenue)],
      ['Total Transactions', metrics.totalTransactions.toString()],
      ['Average Transaction', formatNaira(metrics.averageTransaction)],
      ['Success Rate', `${metrics.successRate.toFixed(1)}%`],
      ['Deposit Revenue', formatNaira(metrics.depositRevenue)],
      ['Full Payment Revenue', formatNaira(metrics.fullPaymentRevenue)],
      ['Refunded Amount', formatNaira(metrics.refundedAmount)],
      ['Pending Amount', formatNaira(metrics.pendingAmount)],
      [],
      ['Monthly Breakdown'],
      ['Month', 'Revenue', 'Transactions'],
      ...monthlyData.map(month => [
        month.month,
        formatNaira(month.revenue),
        month.transactions.toString(),
      ]),
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mr-2" />
        <span>Loading payment analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your payment performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
              <SelectItem value="24">Last 2 years</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNaira(metrics.totalRevenue)}
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
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.totalTransactions}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Transaction</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNaira(metrics.averageTransaction)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className={`text-2xl font-bold ${
                  metrics.successRate >= 90 ? 'text-green-600' : 
                  metrics.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.successRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Types Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Deposit Payments</span>
                    <div className="text-right">
                      <span className="font-bold text-yellow-600">{formatNaira(metrics.depositRevenue)}</span>
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">
                        {metrics.totalRevenue > 0 ? ((metrics.depositRevenue / metrics.totalRevenue) * 100).toFixed(1) : 0}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Full Payments</span>
                    <div className="text-right">
                      <span className="font-bold text-green-600">{formatNaira(metrics.fullPaymentRevenue)}</span>
                      <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                        {metrics.totalRevenue > 0 ? ((metrics.fullPaymentRevenue / metrics.totalRevenue) * 100).toFixed(1) : 0}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-gray-600">Refunded Amount</span>
                    <span className="font-bold text-red-600">{formatNaira(metrics.refundedAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Amount</span>
                    <span className="font-bold text-gray-600">{formatNaira(metrics.pendingAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.successRate >= 95 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        🎉 Excellent payment success rate! Your payment process is working smoothly.
                      </p>
                    </div>
                  )}
                  
                  {metrics.successRate < 80 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        ⚠️ Low payment success rate. Consider reviewing your payment setup or client communication.
                      </p>
                    </div>
                  )}
                  
                  {metrics.averageTransaction > 10000 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💰 High-value transactions! Your services command premium pricing.
                      </p>
                    </div>
                  )}
                  
                  {metrics.refundedAmount > metrics.totalRevenue * 0.05 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        📊 High refund rate. Consider reviewing your cancellation policy or service quality.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatNaira(value), 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="deposits" fill="#f59e0b" name="Deposits" />
                    <Bar dataKey="fullPayments" fill="#10b981" name="Full Payments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceData.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{service.service_name}</h3>
                      <p className="text-sm text-gray-600">{service.transactions} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatNaira(service.revenue)}</p>
                      <Badge className="mt-1 bg-purple-100 text-purple-800 text-xs">
                        {service.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {statusData.map((status, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="flex-1">
                      <span className="font-medium">{status.name}</span>
                    </div>
                    <span className="font-bold">{status.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};