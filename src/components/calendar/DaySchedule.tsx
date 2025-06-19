
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { TimeSlotRow } from "./TimeSlotRow";

interface DayScheduleProps {
  appointments: any[];
  currentDate: Date;
  loading: boolean;
  onTimeSlotClick: (time: string) => void;
  onSendReminder: (appointment: any) => Promise<void>;
  onCancelAppointment: (appointment: any) => Promise<void>;
  onUpdateAppointmentStatus: (appointmentId: string, status: string) => Promise<void>;
}

export const DaySchedule = ({ 
  appointments, 
  currentDate, 
  loading, 
  onTimeSlotClick, 
  onSendReminder, 
  onCancelAppointment, 
  onUpdateAppointmentStatus 
}: DayScheduleProps) => {
  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM"
  ];

  const getAppointmentForTime = (time: string) => {
    const timeToDate = (timeStr: string, baseDate: Date) => {
      const [timeOnly, period] = timeStr.split(' ');
      const [hours, minutes] = timeOnly.split(':').map(Number);
      const date = new Date(baseDate);
      let hour24 = hours;
      
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      
      date.setHours(hour24, minutes, 0, 0);
      return date;
    };

    const slotTime = timeToDate(time, currentDate);
    
    return appointments.find(apt => {
      const aptStart = new Date(apt.start_time);
      return aptStart.getTime() === slotTime.getTime();
    });
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <span className="text-sm sm:text-base truncate">Today's Schedule</span>
            {appointments.length > 0 && (
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {loading ? (
          <div className="text-center py-8 text-sm">Loading appointments...</div>
        ) : (
          <div className="space-y-1 sm:space-y-2 w-full overflow-hidden">
            {timeSlots.map((time) => {
              const appointment = getAppointmentForTime(time);
              return (
                <div key={time} className="w-full">
                  <TimeSlotRow
                    time={time}
                    appointment={appointment}
                    onTimeSlotClick={onTimeSlotClick}
                    onSendReminder={onSendReminder}
                    onCancelAppointment={onCancelAppointment}
                    onUpdateAppointmentStatus={onUpdateAppointmentStatus}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
