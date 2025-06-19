
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Save, Calendar } from "lucide-react";
import { TimeBlocksManager } from "./TimeBlocksManager";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

type ViewType = 'availability' | 'time-blocks';

export const AvailabilityManager = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<ViewType>('availability');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAvailability();
    }
  }, [user]);

  const loadAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('professional_id', user?.id)
        .order('day_of_week');

      if (error) throw error;

      const existingDays = data?.map(a => a.day_of_week) || [];
      const defaultAvailability = DAYS.map(day => {
        const existing = data?.find(a => a.day_of_week === day.value);
        return existing || {
          day_of_week: day.value,
          start_time: "09:00",
          end_time: "17:00",
          is_available: false
        };
      });

      setAvailability(defaultAvailability);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = (dayIndex: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availability];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setAvailability(updated);
  };

  const saveAvailability = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await supabase
        .from('availability')
        .delete()
        .eq('professional_id', user.id);

      const availableSlots = availability
        .filter(slot => slot.is_available)
        .map(slot => ({
          professional_id: user.id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
        }));

      if (availableSlots.length > 0) {
        const { error } = await supabase
          .from('availability')
          .insert(availableSlots);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Availability settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading availability settings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Availability Management
          </h2>
          <p className="text-gray-600 mt-1">Configure your working hours and time blocks</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'availability' ? 'default' : 'outline'}
            onClick={() => setView('availability')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Working Hours
          </Button>
          <Button
            variant={view === 'time-blocks' ? 'default' : 'outline'}
            onClick={() => setView('time-blocks')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Time Blocks
          </Button>
          {view === 'availability' && (
            <Button 
              onClick={saveAvailability} 
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      {view === 'availability' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map((day, index) => (
                <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24">
                    <Label className="font-semibold text-gray-700">{day.label}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={availability[index]?.is_available || false}
                      onCheckedChange={(checked) => updateAvailability(index, 'is_available', checked)}
                    />
                    <Label className="text-sm text-gray-600">Available</Label>
                  </div>

                  {availability[index]?.is_available && (
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">From:</Label>
                        <Input
                          type="time"
                          value={availability[index]?.start_time || "09:00"}
                          onChange={(e) => updateAvailability(index, 'start_time', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">To:</Label>
                        <Input
                          type="time"
                          value={availability[index]?.end_time || "17:00"}
                          onChange={(e) => updateAvailability(index, 'end_time', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-purple-800">Pro Tip</h4>
                  <p className="text-sm text-purple-600 mt-1">
                    Use the Time Blocks feature to set specific vacation periods, breaks, or unavailable times. 
                    This ensures clients can't book during times when you're not available, even within your regular working hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {view === 'time-blocks' && <TimeBlocksManager />}
    </div>
  );
};
