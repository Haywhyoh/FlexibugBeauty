
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FollowUpTask {
  id: string;
  lead_id: string;
  professional_id: string;
  task_type: 'call' | 'email' | 'meeting' | 'custom';
  title: string;
  description?: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export const useFollowUpTasks = (leadId?: string) => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('follow_up_tasks')
        .select('*')
        .eq('professional_id', user.id);

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedTasks = (data || []).map(task => ({
        ...task,
        task_type: task.task_type as FollowUpTask['task_type'],
        priority: task.priority as FollowUpTask['priority']
      }));
      
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error fetching follow-up tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load follow-up tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<FollowUpTask, 'id' | 'professional_id' | 'created_at' | 'updated_at' | 'is_completed' | 'completed_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('follow_up_tasks')
        .insert({
          ...task,
          professional_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchTasks();
      return data;
    } catch (error) {
      console.error('Error creating follow-up task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
      return null;
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('follow_up_tasks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      
      await fetchTasks();
      toast({
        title: "Task Completed",
        description: "Follow-up task marked as completed",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<FollowUpTask>) => {
    try {
      const { error } = await supabase
        .from('follow_up_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.id, leadId]);

  return {
    tasks,
    loading,
    createTask,
    completeTask,
    updateTask,
    refetchTasks: fetchTasks
  };
};
