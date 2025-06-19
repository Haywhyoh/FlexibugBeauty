
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const CalendarHeader = ({ currentDate, onDateChange }: CalendarHeaderProps) => {
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 w-full">
            <Button variant="outline" size="sm" onClick={goToPreviousDay} className="shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <h2 className="text-base sm:text-xl font-semibold">
                {/* Mobile: Shorter format, Desktop: Full format */}
                <span className="sm:hidden">
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="hidden sm:inline">
                  {currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={goToNextDay} className="shrink-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
