import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { useTimeBlocks } from "@/hooks/useTimeBlocks";

interface MonthlyCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentAction?: (appointment: any, action: string) => void;
}

export const MonthlyCalendarView = ({ currentDate, onDateChange, onAppointmentAction }: MonthlyCalendarViewProps) => {
  const getMonthStart = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    return start;
  };
  const getMonthEnd = (date: Date) => {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return end;
  };
  const getCalendarStart = (date: Date) => {
    const monthStart = getMonthStart(date);
    const start = new Date(monthStart);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return start;
  };

  const monthStart = getMonthStart(currentDate);
  const monthEnd = getMonthEnd(currentDate);
  const calendarStart = getCalendarStart(currentDate);
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { timeBlocks, loading: timeBlocksLoading } = useTimeBlocks();
  const loading = appointmentsLoading || timeBlocksLoading;

  // Filter appointments for current month
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time);
    return aptDate >= monthStart && aptDate <= monthEnd;
  });

  // Filter timeblocks for current month
  const monthTimeBlocks = timeBlocks.filter(block => {
    const blockDate = new Date(block.start_time);
    return blockDate >= monthStart && blockDate <= monthEnd;
  });

  const getCalendarDays = () => {
    const days = [];
    const current = new Date(calendarStart);
    
    // Generate 6 weeks (42 days) to ensure complete month view
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return monthAppointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= dayStart && aptDate <= dayEnd;
    });
  };

  const getTimeBlocksForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return monthTimeBlocks.filter(block => {
      const blockDate = new Date(block.start_time);
      return blockDate >= dayStart && blockDate <= dayEnd;
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Badge variant="secondary">
              {monthAppointments.length} appointment{monthAppointments.length !== 1 ? 's' : ''} this month
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              const dayTimeBlocks = getTimeBlocksForDay(day);
              const isCurrentMonthDay = isCurrentMonth(day);
              const isTodayDay = isToday(day);
              const totalItems = dayAppointments.length + dayTimeBlocks.length;
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] p-2 border rounded-lg transition-colors
                    ${isTodayDay ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-200'}
                    ${!isCurrentMonthDay ? 'opacity-40' : ''}
                    hover:bg-gray-50
                  `}
                >
                  <div className={`text-sm font-medium mb-2 ${isTodayDay ? 'text-purple-700' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </div>
                  
                  {loading ? (
                    <div className="text-xs text-gray-400">Loading...</div>
                  ) : (
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`
                            text-xs p-1 rounded cursor-pointer
                            ${appointment.status === 'confirmed' ? 'bg-purple-100 text-purple-700' : ''}
                            ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                            ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                          `}
                        >
                          <div className="truncate">
                            {appointment.client?.full_name || appointment.client_name}
                          </div>
                        </div>
                      ))}
                      {dayTimeBlocks.slice(0, 1).map((block) => (
                        <div
                          key={block.id}
                          className="text-xs p-1 rounded bg-gray-200 text-gray-600"
                        >
                          <div className="font-medium truncate flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span className="truncate">{block.title || 'Blocked'}</span>
                          </div>
                        </div>
                      ))}
                      {totalItems > 3 && (
                        <div className="text-xs text-gray-500 font-medium mt-1">
                          +{totalItems - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
