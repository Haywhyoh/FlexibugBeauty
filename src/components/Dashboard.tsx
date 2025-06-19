
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  DollarSign,
  Star,
  Activity,
  ExternalLink
} from "lucide-react";

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { user } = useAuth();
  const { profile, loading, getDisplayName, getUserInitials } = useUserProfile();

  // Quick stats for dashboard home
  const quickStats = [
    {
      title: "Today's Appointments",
      value: "8",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "New Messages",
      value: "3",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "New Leads",
      value: "5",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "This Week Revenue",
      value: "$2,450",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
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
            <Card key={index} className="hover:shadow-md transition-shadow">
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
                onClick={() => onViewChange("messages")}
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm font-medium">Check Messages</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 p-2 sm:p-4"
                onClick={() => onViewChange("leads")}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm font-medium">Manage Leads</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 p-2 sm:p-4"
                onClick={() => onViewChange("clients")}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm font-medium">View Clients</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
