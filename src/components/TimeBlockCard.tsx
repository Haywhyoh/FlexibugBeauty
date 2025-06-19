
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { TimeBlock } from "@/hooks/useTimeBlocks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TimeBlockCardProps {
  timeBlock: TimeBlock;
  onEdit: (timeBlock: TimeBlock) => void;
  onDelete: (id: string) => void;
}

export const TimeBlockCard = ({ timeBlock, onEdit, onDelete }: TimeBlockCardProps) => {
  const getTypeIcon = (type: TimeBlock['type']) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'break': return '☕';
      case 'unavailable': return '🚫';
      default: return '📅';
    }
  };

  const getTypeColor = (type: TimeBlock['type']) => {
    switch (type) {
      case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break': return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const startDateTime = formatDateTime(timeBlock.start_time);
  const endDateTime = formatDateTime(timeBlock.end_time);

  const isActive = () => {
    const now = new Date();
    const start = new Date(timeBlock.start_time);
    const end = new Date(timeBlock.end_time);
    return now >= start && now <= end;
  };

  const isPast = () => {
    const now = new Date();
    const end = new Date(timeBlock.end_time);
    return now > end;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isActive() ? 'ring-2 ring-purple-300 bg-purple-50/50' : ''} ${isPast() ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getTypeIcon(timeBlock.type)}</span>
              <Badge variant="secondary" className={getTypeColor(timeBlock.type)}>
                {timeBlock.type.charAt(0).toUpperCase() + timeBlock.type.slice(1)}
              </Badge>
              {isActive() && (
                <Badge variant="default" className="bg-purple-600 text-white">
                  Active
                </Badge>
              )}
              {isPast() && (
                <Badge variant="outline" className="text-gray-500">
                  Past
                </Badge>
              )}
            </div>

            {timeBlock.title && (
              <h3 className="font-semibold text-gray-800 mb-1">{timeBlock.title}</h3>
            )}

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {startDateTime.date === endDateTime.date 
                    ? startDateTime.date
                    : `${startDateTime.date} - ${endDateTime.date}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{startDateTime.time} - {endDateTime.time}</span>
              </div>
            </div>

            {timeBlock.description && (
              <p className="text-sm text-gray-600 mt-2">{timeBlock.description}</p>
            )}
          </div>

          <div className="flex gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(timeBlock)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Time Block</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this time block? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(timeBlock.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
