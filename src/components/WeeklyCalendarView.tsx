
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useTimeBlocks } from "@/hooks/useTimeBlocks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentAction: (appointment: any, action: string) => void;
}

export const WeeklyCalendarView = ({ currentDate, onDateChange, onAppointmentAction }: WeeklyCalendarViewProps) => {
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const weekStart = getWeekStart(currentDate);
  const weekEnd = getWeekEnd(currentDate);
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { timeBlocks, loading: timeBlocksLoading } = useTimeBlocks();
  const loading = appointmentsLoading || timeBlocksLoading;

  // Filter appointments for current week
  const weekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time);
    return aptDate >= weekStart && aptDate <= weekEnd;
  });

  // Filter timeblocks for current week
  const weekTimeBlocks = timeBlocks.filter(block => {
    const blockStart = new Date(block.start_time);
    return blockStart >= weekStart && blockStart <= weekEnd;
  });

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getItemsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayAppointments = weekAppointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= dayStart && aptDate <= dayEnd;
    });

    const dayTimeBlocks = weekTimeBlocks.filter(block => {
      const blockStart = new Date(block.start_time);
      const blockEnd = new Date(block.end_time);
      const blockStartDateOnly = new Date(blockStart.getFullYear(), blockStart.getMonth(), blockStart.getDate());
      return blockStartDateOnly.getTime() === dayStart.getTime();
    });

    const items = [
      ...dayAppointments.map(apt => ({...apt, itemType: 'appointment'})),
      ...dayTimeBlocks.map(block => ({...block, itemType: 'time_block'}))
    ];

    return items.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-purple-100 border-l-4 border-purple-500';
      case 'cancelled': return 'bg-red-100 border-l-4 border-red-500';
      case 'completed': return 'bg-green-100 border-l-4 border-green-500';
      case 'no_show': return 'bg-gray-100 border-l-4 border-gray-500';
      default: return 'bg-yellow-100 border-l-4 border-yellow-500';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Week Navigation - Mobile Responsive */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            {/* Navigation Controls */}
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center sm:text-left">
                <h2 className="text-base sm:text-xl font-semibold">
                  {/* Mobile: Show month only, Desktop: Show full range */}
                  <span className="sm:hidden">
                    {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="hidden sm:inline">
                    {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Appointment Count */}
            <Badge variant="secondary" className="self-center text-xs">
              {weekAppointments.length} appointment{weekAppointments.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Week Grid - Mobile Responsive */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-7 sm:gap-4">
        {weekDays.map((day, index) => {
          const dayItems = getItemsForDay(day);
          return (
            <Card key={index} className={`${isToday(day) ? 'ring-2 ring-purple-300 bg-purple-50/50' : 'bg-white/70'} backdrop-blur-sm`}>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-center">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-base sm:text-lg font-bold ${isToday(day) ? 'text-purple-600' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-2 sm:px-4">
                {loading ? (
                  <div className="text-xs text-gray-500 text-center py-2">Loading...</div>
                ) : dayItems.length > 0 ? (
                  <div className="space-y-1 sm:space-y-2">
                    {dayItems.map((item: any) => (
                      item.itemType === 'appointment' ? (
                      <div key={item.id} className={`p-2 rounded-lg text-xs ${getStatusColor(item.status)}`}>
                        <div className="font-semibold text-gray-800 truncate">
                          {item.client?.full_name || item.client_name}
                        </div>
                        <div className="text-gray-600 truncate text-xs">
                          {item.service?.name}
                        </div>
                        <div className="text-gray-500 flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(item.start_time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <Badge variant={item.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs px-1 py-0">
                            {item.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-xs">•••</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => onAppointmentAction(item, 'reminder')}>
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAppointmentAction(item, 'complete')}>
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAppointmentAction(item, 'cancel')}>
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      ) : (
                        <div key={item.id} className="p-2 rounded-lg text-xs bg-gray-100 border-l-4 border-gray-400">
                          <div className="font-semibold text-gray-700 truncate flex items-center gap-1">
                            <Lock className="w-3 h-3 flex-shrink-0"/>
                            <span className="truncate">{item.title || 'Blocked'}</span>
                          </div>
                          <div className="text-gray-500 flex items-center gap-1 mt-1 text-xs">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(item.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(item.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-2 sm:py-4">
                    No appointments
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
