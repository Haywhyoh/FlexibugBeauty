
import { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { DaySchedule } from "./calendar/DaySchedule";
import { BookingEngine } from "./BookingEngine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DayCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSendReminder: (appointment: any) => Promise<void>;
  onCancelAppointment: (appointment: any) => Promise<void>;
  onUpdateAppointmentStatus: (appointmentId: string, status: string) => Promise<void>;
}

export const DayCalendarView = ({ 
  currentDate, 
  onDateChange, 
  onSendReminder, 
  onCancelAppointment, 
  onUpdateAppointmentStatus 
}: DayCalendarViewProps) => {
  const { appointments, loading } = useAppointments(currentDate);
  const { user } = useAuth();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const handleTimeSlotClick = (time: string) => {
    setSelectedTimeSlot(time);
    setIsBookingDialogOpen(true);
  };

  const handleBookingComplete = () => {
    setIsBookingDialogOpen(false);
    setSelectedTimeSlot(null);
  };

  return (
    <>
      <CalendarHeader currentDate={currentDate} onDateChange={onDateChange} />
      
      <DaySchedule
        appointments={appointments}
        currentDate={currentDate}
        loading={loading}
        onTimeSlotClick={handleTimeSlotClick}
        onSendReminder={onSendReminder}
        onCancelAppointment={onCancelAppointment}
        onUpdateAppointmentStatus={onUpdateAppointmentStatus}
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
