
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/hooks/useAppointments";
import { AvailabilityManager } from "./AvailabilityManager";
import { WeeklyCalendarView } from "./WeeklyCalendarView";
import { MonthlyCalendarView } from "./MonthlyCalendarView";
import { DayCalendarView } from "./DayCalendarView";
import { DragDropCalendarView } from "./DragDropCalendarView";
import { BookingEngine } from "./BookingEngine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'drag-drop' | 'availability'>('day');
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const { user } = useAuth();
  const { updateAppointmentStatus } = useAppointments();
  const { sendReminderEmail, sendCancellationEmail } = useEmailNotifications();

  const handleSendReminder = async (appointment: any) => {
    const professionalName = user?.user_metadata?.full_name || 'Beauty Professional';
    await sendReminderEmail(appointment, professionalName);
  };

  const handleCancelAppointment = async (appointment: any) => {
    const professionalName = user?.user_metadata?.full_name || 'Beauty Professional';
    await updateAppointmentStatus(appointment.id, 'cancelled');
    await sendCancellationEmail(appointment, professionalName);
  };

  const handleAppointmentAction = async (appointment: any, action: string) => {
    switch (action) {
      case 'reminder':
        await handleSendReminder(appointment);
        break;
      case 'complete':
        await updateAppointmentStatus(appointment.id, 'completed');
        break;
      case 'cancel':
        await handleCancelAppointment(appointment);
        break;
    }
  };

  const handleNewAppointmentComplete = () => {
    setIsNewAppointmentDialogOpen(false);
  };

  const handleBackToCalendar = () => {
    setView('day');
  };

  if (view === 'availability') {
    return (
      <div className="h-full">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToCalendar}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calendar
            </Button>
          </div>
          <AvailabilityManager />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header - Mobile Responsive */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your appointments and availability
            </p>
          </div>
          
          {/* Action Buttons - Mobile Stacked */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setView('availability')}
              className="w-full sm:w-auto text-sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              Set Availability
            </Button>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm"
              onClick={() => setIsNewAppointmentDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* View Selector - Mobile Responsive */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="space-y-3">
              {/* Mobile: 2x2 Grid, Tablet+: Horizontal */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <Button 
                  variant={view === 'day' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('day')}
                  className="text-xs sm:text-sm"
                >
                  Day
                </Button>
                <Button 
                  variant={view === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('week')}
                  className="text-xs sm:text-sm"
                >
                  Week
                </Button>
                <Button 
                  variant={view === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('month')}
                  className="text-xs sm:text-sm"
                >
                  Month
                </Button>
                <Button 
                  variant={view === 'drag-drop' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setView('drag-drop')}
                  className="col-span-2 sm:col-span-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs sm:text-sm"
                >
                  Drag & Drop
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Views - Mobile Optimized */}
        <div className="flex-1 min-h-0">
          {view === 'week' && (
            <WeeklyCalendarView 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onAppointmentAction={handleAppointmentAction}
            />
          )}

          {view === 'month' && (
            <MonthlyCalendarView 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onAppointmentAction={handleAppointmentAction}
            />
          )}

          {view === 'day' && (
            <DayCalendarView 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onSendReminder={handleSendReminder}
              onCancelAppointment={handleCancelAppointment}
              onUpdateAppointmentStatus={updateAppointmentStatus}
            />
          )}

          {view === 'drag-drop' && (
            <DragDropCalendarView 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onSendReminder={handleSendReminder}
              onCancelAppointment={handleCancelAppointment}
              onUpdateAppointmentStatus={updateAppointmentStatus}
            />
          )}
        </div>

        {/* New Appointment Dialog - Mobile Responsive */}
        <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Create New Appointment</DialogTitle>
            </DialogHeader>
            <BookingEngine 
              professionalId={user?.id || ''}
              onBookingComplete={handleNewAppointmentComplete}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
