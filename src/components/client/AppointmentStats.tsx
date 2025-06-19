
import { Card, CardContent } from "@/components/ui/card";
import { Appointment } from "@/hooks/useAppointments";

interface AppointmentStatsProps {
  appointments: Appointment[];
}

export const AppointmentStats = ({ appointments }: AppointmentStatsProps) => {
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.start_time) > new Date() && apt.status === 'confirmed'
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.start_time) < new Date() || apt.status === 'completed'
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {upcomingAppointments.length}
          </div>
          <div className="text-gray-600">Upcoming</div>
        </CardContent>
      </Card>
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-pink-600 mb-2">
            {pastAppointments.length}
          </div>
          <div className="text-gray-600">Completed</div>
        </CardContent>
      </Card>
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {appointments.length}
          </div>
          <div className="text-gray-600">Total</div>
        </CardContent>
      </Card>
    </div>
  );
};
