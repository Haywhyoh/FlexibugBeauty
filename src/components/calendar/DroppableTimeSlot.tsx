
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DraggableAppointment } from "./DraggableAppointment";
import { Appointment } from "@/hooks/useAppointments";

interface DroppableTimeSlotProps {
  time: string;
  date: Date;
  appointment?: Appointment;
  onTimeSlotClick: (time: string) => void;
  onAppointmentAction?: (appointment: Appointment, action: string) => void;
}

export const DroppableTimeSlot = ({ 
  time, 
  date, 
  appointment, 
  onTimeSlotClick,
  onAppointmentAction 
}: DroppableTimeSlotProps) => {
  const slotId = `${date.toISOString().split('T')[0]}-${time}`;
  
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
    data: {
      type: 'timeslot',
      time,
      date,
    },
  });

  const isSlotAvailable = !appointment;
  
  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[80px] p-2 border rounded-lg transition-all duration-200
        ${isOver && isSlotAvailable ? 'bg-purple-50 border-purple-300 border-2' : 'border-gray-200'}
        ${isOver && !isSlotAvailable ? 'bg-red-50 border-red-300' : ''}
        ${isSlotAvailable ? 'hover:bg-gray-50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{time}</span>
        {isSlotAvailable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTimeSlotClick(time)}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {appointment ? (
        <DraggableAppointment appointment={appointment}>
          {onAppointmentAction && (
            <div className="flex gap-1 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-6"
                onClick={() => onAppointmentAction(appointment, 'complete')}
              >
                Complete
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-6"
                onClick={() => onAppointmentAction(appointment, 'cancel')}
              >
                Cancel
              </Button>
            </div>
          )}
        </DraggableAppointment>
      ) : (
        <div className={`
          flex items-center justify-center h-full min-h-[40px] rounded-lg border-2 border-dashed transition-colors
          ${isOver ? 'border-purple-300 bg-purple-25' : 'border-gray-200'}
        `}>
          <span className="text-xs text-gray-400">Available</span>
        </div>
      )}
    </div>
  );
};
