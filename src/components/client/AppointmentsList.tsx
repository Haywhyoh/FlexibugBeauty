
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { Appointment } from "@/hooks/useAppointments";
import { AppointmentCard } from "./AppointmentCard";

interface AppointmentsListProps {
  appointments: Appointment[];
  onCancelAppointment: (appointmentId: string) => Promise<void>;
  cancelingId: string | null;
}

export const AppointmentsList = ({ 
  appointments, 
  onCancelAppointment, 
  cancelingId 
}: AppointmentsListProps) => {
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.start_time) > new Date() && apt.status === 'confirmed'
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.start_time) < new Date() || apt.status === 'completed'
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming appointments</p>
              <p className="text-sm text-gray-500 mt-2">
                Browse beauty professionals to book your next appointment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  showActions={true}
                  onCancel={onCancelAppointment}
                  cancelingId={cancelingId}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Past Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                />
              ))}
              {pastAppointments.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All Past Appointments ({pastAppointments.length - 5} more)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
