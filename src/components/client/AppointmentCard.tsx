
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Appointment } from "@/hooks/useAppointments";

interface AppointmentCardProps {
  appointment: Appointment & {
    professional?: {
      full_name?: string;
      business_name?: string;
      avatar_url?: string;
    };
  };
  showActions?: boolean;
  onCancel?: (appointmentId: string) => Promise<void>;
  cancelingId?: string | null;
}

export const AppointmentCard = ({ 
  appointment, 
  showActions = false, 
  onCancel,
  cancelingId 
}: AppointmentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleCancel = async () => {
    if (onCancel) {
      await onCancel(appointment.id);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Header - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                {appointment.service?.name || 'Service'}
              </h3>
              <p className="text-gray-600 text-sm truncate">
                with {appointment.professional?.full_name || appointment.professional?.business_name || 'Beauty Professional'}
              </p>
            </div>
            <Badge className={`${getStatusColor(appointment.status)} whitespace-nowrap`}>
              {appointment.status}
            </Badge>
          </div>

          {/* Details - Mobile Stacked */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {format(new Date(appointment.start_time), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {format(new Date(appointment.start_time), 'h:mm a')} - {format(new Date(appointment.end_time), 'h:mm a')}
              </span>
            </div>
            {appointment.service?.duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  Duration: {appointment.service.duration_minutes} minutes
                </span>
              </div>
            )}
            {appointment.service?.price && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-center flex-shrink-0">$</span>
                <span className="truncate">
                  Price: ${appointment.service.price}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 break-words">{appointment.notes}</p>
            </div>
          )}

          {/* Actions - Mobile Full Width */}
          {showActions && appointment.status === 'confirmed' && (
            <div className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Cancel Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Cancel Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Keep Appointment
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancel}
                      disabled={cancelingId === appointment.id}
                      className="w-full sm:w-auto"
                    >
                      {cancelingId === appointment.id ? 'Cancelling...' : 'Cancel Appointment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
