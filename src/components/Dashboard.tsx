
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/services/paystackService";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  DollarSign,
  Star,
  Activity,
  ExternalLink,
  CreditCard,
  CalendarCheck,
  AlertCircle
} from "lucide-react";

interface DashboardProps {
  onViewChange: (view: string) => void;
}

interface DashboardStats {
  todaysAppointments: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalClients: number;
  depositsPaid: number;
  upcomingAppointments: number;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { user } = useAuth();
  const { profile, loading, getDisplayName, getUserInitials } = useUserProfile();
  const [stats, setStats] = useState<DashboardStats>({
    todaysAppointments: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    totalClients: 0,
    depositsPaid: 0,
    upcomingAppointments: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Today's appointments
      const { data: todaysAppointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', user.id)
        .gte('start_time', today.toISOString().split('T')[0])
        .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Upcoming appointments (next 7 days)
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', user.id)
        .eq('status', 'confirmed')
        .gte('start_time', today.toISOString())
        .lte('start_time', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

      // Weekly revenue from successful transactions
      const { data: weeklyTransactions } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('professional_id', user.id)
        .eq('status', 'success')
        .gte('created_at', startOfWeek.toISOString());

      // Monthly revenue
      const { data: monthlyTransactions } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('professional_id', user.id)
        .eq('status', 'success')
        .gte('created_at', startOfMonth.toISOString());

      // Pending payments (appointments with unpaid deposits)
      const { data: pendingPayments } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', user.id)
        .eq('deposit_required', true)
        .eq('deposit_paid', false)
        .neq('status', 'cancelled');

      // Total unique clients
      const { data: clientEmails } = await supabase
        .from('appointments')
        .select('client_email')
        .eq('professional_id', user.id);

      // Deposits paid this month
      const { data: depositTransactions } = await supabase
        .from('payment_transactions')
        .select('id')
        .eq('professional_id', user.id)
        .eq('status', 'success')
        .eq('transaction_type', 'deposit')
        .gte('created_at', startOfMonth.toISOString());

      const uniqueClients = clientEmails ? new Set(clientEmails.map(c => c.client_email)).size : 0;
      const weeklyRevenue = weeklyTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const monthlyRevenue = monthlyTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      setStats({
        todaysAppointments: todaysAppointments?.length || 0,
        weeklyRevenue,
        monthlyRevenue,
        pendingPayments: pendingPayments?.length || 0,
        totalClients: uniqueClients,
        depositsPaid: depositTransactions?.length || 0,
        upcomingAppointments: upcomingAppointments?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Dynamic quick stats based on real data
  const quickStats = [
    {
      title: "Today's Appointments",
      value: isLoadingStats ? "..." : stats.todaysAppointments.toString(),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      onClick: () => onViewChange("appointments")
    },
    {
      title: "Monthly Revenue",
      value: isLoadingStats ? "..." : formatNaira(stats.monthlyRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      onClick: () => onViewChange("payments")
    },
    {
      title: "Pending Payments",
      value: isLoadingStats ? "..." : stats.pendingPayments.toString(),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      onClick: () => onViewChange("appointments")
    },
    {
      title: "Total Clients",
      value: isLoadingStats ? "..." : stats.totalClients.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      onClick: () => onViewChange("clients")
    }
  ];

  const publicProfileUrl = profile?.business_slug 
    ? `/profile/${profile.business_slug}` 
    : `/profile/${user?.id}`;

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* User Profile Section - Mobile First */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            {/* Mobile Layout: Stacked */}
            <div className="flex flex-col space-y-4 sm:hidden">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {getDisplayName()}
                  </h2>
                  <p className="text-sm text-gray-600 truncate">
                    Welcome back! 👋
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Professional
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                  Pro Account
                </Badge>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(publicProfileUrl, '_blank')}
                className="flex items-center justify-center gap-2 w-full"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">View Public Profile</span>
              </Button>
            </div>

            {/* Tablet and Desktop Layout: Side by side */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 lg:h-16 lg:w-16">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-lg lg:text-xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    {getDisplayName()}
                  </h2>
                  <p className="text-sm lg:text-base text-gray-600">
                    Welcome back! 👋
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Professional
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(publicProfileUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden lg:inline">View Public Profile</span>
                  <span className="lg:hidden">Profile</span>
                </Button>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs lg:text-sm">
                  Pro Account
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Header - Mobile First */}
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Quick Stats - Mobile First Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={stat.onClick}>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 leading-tight">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} self-start sm:self-auto`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekly Revenue</span>
                <span className="font-semibold">{formatNaira(stats.weeklyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="font-semibold">{formatNaira(stats.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Deposits This Month</span>
                <span className="font-semibold">{stats.depositsPaid}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => onViewChange("payments")}
              >
                View Full Payment History
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Next 7 Days</span>
                <span className="font-semibold">{stats.upcomingAppointments} appointments</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Payments</span>
                <span className={`font-semibold ${
                  stats.pendingPayments > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.pendingPayments}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => onViewChange("appointments")}
              >
                Manage Appointments
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile First */}
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 p-2 sm:p-4"
                onClick={() => onViewChange("calendar")}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm font-medium">View Calendar</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 p-2 sm:p-4"
                onClick={() => onViewChange("appointments")}
              >
                <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm font-medium">Appointments</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 p-2 sm:p-4"
                onClick={() => onViewChange("payments")}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm font-medium">Payment History</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 p-2 sm:p-4"
                onClick={() => onViewChange("payment-settings")}
              >
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm font-medium">Payment Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
