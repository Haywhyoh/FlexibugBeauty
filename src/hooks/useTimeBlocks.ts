import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TimeBlock {
  id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  type: 'unavailable' | 'break' | 'vacation';
  title?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useTimeBlocks = (date?: Date) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadTimeBlocks();
    }
  }, [user, date]);

  const loadTimeBlocks = async () => {
    try {
      let query = supabase
        .from('time_blocks')
        .select('*')
        .eq('professional_id', user?.id)
        .order('start_time');

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .lte('start_time', endOfDay.toISOString())
          .gte('end_time', startOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        type: item.type as TimeBlock['type']
      })) as TimeBlock[];
      
      setTimeBlocks(typedData);
    } catch (error) {
      console.error('Error loading time blocks:', error);
      toast({
        title: "Error",
        description: "Failed to load time blocks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTimeBlock = async (
    startTime: string,
    endTime: string,
    type: TimeBlock['type'],
    title?: string,
    description?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('time_blocks')
        .insert({
          professional_id: user.id,
          start_time: startTime,
          end_time: endTime,
          type,
          title,
          description,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        type: data.type as TimeBlock['type']
      } as TimeBlock;

      setTimeBlocks(prev => [...prev, typedData]);
      toast({
        title: "Success",
        description: "Time block created successfully",
      });
      return typedData;
    } catch (error) {
      console.error('Error creating time block:', error);
      toast({
        title: "Error",
        description: "Failed to create time block",
        variant: "destructive",
      });
    }
  };

  const updateTimeBlock = async (
    id: string,
    updates: Partial<Omit<TimeBlock, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('time_blocks')
        .update(updates)
        .eq('id', id)
        .eq('professional_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        type: data.type as TimeBlock['type']
      } as TimeBlock;

      setTimeBlocks(prev => prev.map(block => 
        block.id === id ? typedData : block
      ));
      toast({
        title: "Success",
        description: "Time block updated successfully",
      });
      return typedData;
    } catch (error) {
      console.error('Error updating time block:', error);
      toast({
        title: "Error",
        description: "Failed to update time block",
        variant: "destructive",
      });
    }
  };

  const deleteTimeBlock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', id)
        .eq('professional_id', user?.id);

      if (error) throw error;

      setTimeBlocks(prev => prev.filter(block => block.id !== id));
      toast({
        title: "Success",
        description: "Time block deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting time block:', error);
      toast({
        title: "Error",
        description: "Failed to delete time block",
        variant: "destructive",
      });
    }
  };

  return {
    timeBlocks,
    loading,
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    refetch: loadTimeBlocks,
  };
};
