
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Grip } from "lucide-react";
import { Appointment } from "@/hooks/useAppointments";

interface DraggableAppointmentProps {
  appointment: Appointment;
  children?: React.ReactNode;
}

export const DraggableAppointment = ({ appointment, children }: DraggableAppointmentProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: appointment.id,
    data: {
      type: 'appointment',
      appointment,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-purple-100 border-l-4 border-purple-500';
      case 'cancelled': return 'bg-red-100 border-l-4 border-red-500';
      case 'completed': return 'bg-green-100 border-l-4 border-green-500';
      case 'no_show': return 'bg-gray-100 border-l-4 border-gray-500';
      default: return 'bg-yellow-100 border-l-4 border-yellow-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${isDragging ? 'opacity-50 z-50' : 'opacity-100'}
        transition-opacity duration-200 w-full max-w-full
      `}
    >
      <Card className={`${getStatusColor(appointment.status)} cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow w-full`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 w-full min-w-0">
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-1 min-w-0">
                <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
                <span className="font-medium text-sm truncate">
                  {appointment.client?.full_name || appointment.client_name}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 truncate mb-1">
                {appointment.service?.name}
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {new Date(appointment.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              
              <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                {appointment.status}
              </Badge>
            </div>
            
            <div 
              {...listeners} 
              {...attributes}
              className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing flex-shrink-0"
            >
              <Grip className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
