
import { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointmentReschedule } from "@/hooks/useAppointmentReschedule";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { DragDropCalendar } from "./calendar/DragDropCalendar";
import { BookingEngine } from "./BookingEngine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTimeBlocks } from "@/hooks/useTimeBlocks";

interface DragDropCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSendReminder: (appointment: any) => Promise<void>;
  onCancelAppointment: (appointment: any) => Promise<void>;
  onUpdateAppointmentStatus: (appointmentId: string, status: string) => Promise<void>;
}

export const DragDropCalendarView = ({ 
  currentDate, 
  onDateChange, 
  onSendReminder, 
  onCancelAppointment, 
  onUpdateAppointmentStatus 
}: DragDropCalendarViewProps) => {
  const { appointments, loading: appointmentsLoading } = useAppointments(currentDate);
  const { timeBlocks, loading: timeBlocksLoading } = useTimeBlocks(currentDate);
  const { user } = useAuth();
  const { rescheduleAppointment } = useAppointmentReschedule();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const loading = appointmentsLoading || timeBlocksLoading;

  const handleTimeSlotClick = (time: string) => {
    setSelectedTimeSlot(time);
    setIsBookingDialogOpen(true);
  };

  const handleBookingComplete = () => {
    setIsBookingDialogOpen(false);
    setSelectedTimeSlot(null);
  };

  const handleAppointmentReschedule = async (
    appointmentId: string, 
    newTime: string, 
    newDate: Date
  ) => {
    // Get the appointment to find its duration
    const appointment = appointments.find(apt => apt.id === appointmentId);
    const duration = appointment?.service?.duration_minutes || 60;
    
    await rescheduleAppointment(appointmentId, newTime, newDate, duration);
  };

  const handleAppointmentAction = async (appointment: any, action: string) => {
    switch (action) {
      case 'reminder':
        await onSendReminder(appointment);
        break;
      case 'complete':
        await onUpdateAppointmentStatus(appointment.id, 'completed');
        break;
      case 'cancel':
        await onCancelAppointment(appointment);
        break;
    }
  };

  return (
    <>
      <CalendarHeader currentDate={currentDate} onDateChange={onDateChange} />
      
      <DragDropCalendar
        appointments={appointments}
        timeBlocks={timeBlocks}
        currentDate={currentDate}
        loading={loading}
        onTimeSlotClick={handleTimeSlotClick}
        onAppointmentReschedule={handleAppointmentReschedule}
        onAppointmentAction={handleAppointmentAction}
      />

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Book Appointment for {selectedTimeSlot} on {currentDate.toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          <BookingEngine 
            professionalId={user?.id || ''}
            onBookingComplete={handleBookingComplete}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
