
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Send, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimeSlotRowProps {
  time: string;
  appointment?: any;
  onTimeSlotClick: (time: string) => void;
  onSendReminder: (appointment: any) => Promise<void>;
  onCancelAppointment: (appointment: any) => Promise<void>;
  onUpdateAppointmentStatus: (appointmentId: string, status: string) => Promise<void>;
}

export const TimeSlotRow = ({ 
  time, 
  appointment, 
  onTimeSlotClick, 
  onSendReminder, 
  onCancelAppointment, 
  onUpdateAppointmentStatus 
}: TimeSlotRowProps) => {
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
    <div className="flex items-center gap-4 p-2 border-l-2 border-gray-200 hover:border-purple-300 transition-colors">
      <div className="w-20 text-sm text-gray-600 font-medium">
        {time}
      </div>
      <div className="flex-1">
        {appointment ? (
          <div className={`p-3 rounded-lg ${getStatusColor(appointment.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">
                  {appointment.client?.full_name || appointment.client_name}
                </p>
                <p className="text-sm text-gray-600">{appointment.service?.name}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  {appointment.client_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {appointment.client_phone}
                    </span>
                  )}
                  {appointment.client_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {appointment.client_email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                  {appointment.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">•••</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {appointment.status === 'confirmed' && (
                      <>
                        <DropdownMenuItem onClick={() => onSendReminder(appointment)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateAppointmentStatus(appointment.id, 'completed')}>
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateAppointmentStatus(appointment.id, 'no_show')}>
                          Mark No-show
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCancelAppointment(appointment)}>
                          Cancel & Notify
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-12 flex items-center">
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 w-full justify-start"
              onClick={() => onTimeSlotClick(time)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Available - Book Appointment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
