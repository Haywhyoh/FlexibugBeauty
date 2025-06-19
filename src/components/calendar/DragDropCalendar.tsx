
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock } from "lucide-react";
import { DroppableTimeSlot } from "./DroppableTimeSlot";
import { DraggableAppointment } from "./DraggableAppointment";
import { Appointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { TimeBlock } from "@/hooks/useTimeBlocks";

interface DragDropCalendarProps {
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  currentDate: Date;
  loading: boolean;
  onTimeSlotClick: (time: string) => void;
  onAppointmentReschedule: (appointmentId: string, newTime: string, newDate: Date) => Promise<void>;
  onAppointmentAction?: (appointment: Appointment, action: string) => void;
}

export const DragDropCalendar = ({ 
  appointments, 
  timeBlocks,
  currentDate, 
  loading, 
  onTimeSlotClick,
  onAppointmentReschedule,
  onAppointmentAction 
}: DragDropCalendarProps) => {
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM"
  ];

  const getTimeSlotInfo = (time: string) => {
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
    
    const appointment = appointments.find(apt => {
      const aptStart = new Date(apt.start_time);
      return aptStart.getTime() === slotTime.getTime();
    });

    const timeBlock = timeBlocks.find(block => {
      const blockStart = new Date(block.start_time);
      const blockEnd = new Date(block.end_time);
      return slotTime >= blockStart && slotTime < blockEnd;
    });

    return { appointment, timeBlock };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const appointment = appointments.find(apt => apt.id === active.id);
    setActiveAppointment(appointment || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAppointment(null);

    if (!over || !active.data.current?.appointment) {
      return;
    }

    const appointment = active.data.current.appointment as Appointment;
    const targetData = over.data.current;

    if (targetData?.type === 'timeslot') {
      const { time, date } = targetData;
      
      // Check if the target slot is already occupied or blocked
      const { appointment: existingAppointment, timeBlock } = getTimeSlotInfo(time);
      if (existingAppointment && existingAppointment.id !== appointment.id) {
        toast({
          title: "Cannot reschedule",
          description: "This time slot is already occupied",
          variant: "destructive",
        });
        return;
      }
      if (timeBlock) {
        toast({
          title: "Cannot reschedule",
          description: "This time slot is blocked",
          variant: "destructive",
        });
        return;
      }

      try {
        await onAppointmentReschedule(appointment.id, time, date);
        toast({
          title: "Appointment rescheduled",
          description: `Moved to ${time} on ${date.toLocaleDateString()}`,
        });
      } catch (error) {
        toast({
          title: "Failed to reschedule",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Card className="bg-white/70 backdrop-blur-sm w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">Drag & Drop Schedule</span>
              {appointments.length > 0 && (
                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                  {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Drag appointments to reschedule them to different time slots
          </p>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {loading ? (
            <div className="text-center py-8 text-sm">Loading appointments...</div>
          ) : (
            <div className="w-full overflow-hidden">
              {/* Mobile: Single column with proper spacing */}
              <div className="block sm:hidden space-y-3">
                {timeSlots.map((time) => {
                  const { appointment, timeBlock } = getTimeSlotInfo(time);
                  
                  if (timeBlock && !appointment) {
                    return (
                      <div key={time} className="w-full p-3 border-dashed border-2 border-gray-200 rounded-lg min-h-[80px] flex flex-col justify-center items-center bg-gray-100 cursor-not-allowed">
                         <div className="text-center w-full">
                           <p className="text-sm font-semibold text-gray-500">{time}</p>
                           <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-center">
                             <Lock className="w-3 h-3 flex-shrink-0" />
                             <span className="truncate">{timeBlock.title || 'Blocked'}</span>
                           </div>
                         </div>
                      </div>
                    );
                  }

                  return (
                    <div key={time} className="w-full">
                      <DroppableTimeSlot
                        time={time}
                        date={currentDate}
                        appointment={appointment}
                        onTimeSlotClick={() => timeBlock ? null : onTimeSlotClick(time)}
                        onAppointmentAction={onAppointmentAction}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Tablet and Desktop: Grid layout */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {timeSlots.map((time) => {
                  const { appointment, timeBlock } = getTimeSlotInfo(time);
                  
                  if (timeBlock && !appointment) {
                    return (
                      <div key={time} className="p-2 border-dashed border-2 border-gray-200 rounded-lg min-h-[80px] flex flex-col justify-center items-center bg-gray-100 cursor-not-allowed">
                         <div className="text-center w-full">
                           <p className="text-sm font-semibold text-gray-500">{time}</p>
                           <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-center">
                             <Lock className="w-3 h-3 flex-shrink-0" />
                             <span className="truncate">{timeBlock.title || 'Blocked'}</span>
                           </div>
                         </div>
                      </div>
                    );
                  }

                  return (
                    <DroppableTimeSlot
                      key={time}
                      time={time}
                      date={currentDate}
                      appointment={appointment}
                      onTimeSlotClick={() => timeBlock ? null : onTimeSlotClick(time)}
                      onAppointmentAction={onAppointmentAction}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DragOverlay>
        {activeAppointment ? (
          <DraggableAppointment appointment={activeAppointment} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
