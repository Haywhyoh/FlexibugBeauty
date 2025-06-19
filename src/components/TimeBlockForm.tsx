
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Save, X } from "lucide-react";
import { TimeBlock } from "@/hooks/useTimeBlocks";

interface TimeBlockFormProps {
  onSave: (
    startTime: string,
    endTime: string,
    type: TimeBlock['type'],
    title?: string,
    description?: string
  ) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TimeBlock>;
  isEditing?: boolean;
}

export const TimeBlockForm = ({ onSave, onCancel, initialData, isEditing }: TimeBlockFormProps) => {
  const [startDate, setStartDate] = useState(
    initialData?.start_time ? new Date(initialData.start_time).toISOString().split('T')[0] : ''
  );
  const [startTime, setStartTime] = useState(
    initialData?.start_time ? new Date(initialData.start_time).toTimeString().slice(0, 5) : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_time ? new Date(initialData.end_time).toISOString().split('T')[0] : ''
  );
  const [endTime, setEndTime] = useState(
    initialData?.end_time ? new Date(initialData.end_time).toTimeString().slice(0, 5) : ''
  );
  const [type, setType] = useState<TimeBlock['type']>(initialData?.type || 'vacation');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !startTime || !endDate || !endTime) {
      return;
    }

    setSaving(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();
      
      await onSave(startDateTime, endDateTime, type, title || undefined, description || undefined);
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: TimeBlock['type']) => {
    switch (type) {
      case 'vacation': return 'Vacation';
      case 'break': return 'Break';
      case 'unavailable': return 'Unavailable';
      default: return 'Unavailable';
    }
  };

  const getTypeColor = (type: TimeBlock['type']) => {
    switch (type) {
      case 'vacation': return 'text-blue-600';
      case 'break': return 'text-green-600';
      case 'unavailable': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          {isEditing ? 'Edit Time Block' : 'Create New Time Block'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as TimeBlock['type'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">
                  <span className="text-blue-600">🏖️ Vacation</span>
                </SelectItem>
                <SelectItem value="break">
                  <span className="text-green-600">☕ Break</span>
                </SelectItem>
                <SelectItem value="unavailable">
                  <span className="text-red-600">🚫 Unavailable</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Vacation, Lunch Break"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about this time block..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
