
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClientAppointments } from "@/hooks/useClientAppointments";
import { useState } from "react";
import { AppointmentStats } from "./client/AppointmentStats";
import { AppointmentsList } from "./client/AppointmentsList";

export const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const { appointments, loading, cancelAppointment } = useClientAppointments();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancelingId(appointmentId);
    await cancelAppointment(appointmentId);
    setCancelingId(null);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with User Info and Logout */}
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              My Appointments
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="ml-4">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <AppointmentStats appointments={appointments} />

        {/* Appointments Lists */}
        <AppointmentsList 
          appointments={appointments}
          onCancelAppointment={handleCancelAppointment}
          cancelingId={cancelingId}
        />
      </div>
    </div>
  );
};
