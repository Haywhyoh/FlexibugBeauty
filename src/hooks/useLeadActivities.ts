
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LeadActivity {
  id: string;
  lead_id: string;
  professional_id: string;
  activity_type: 'email_sent' | 'call_made' | 'meeting_scheduled' | 'note_added';
  activity_data: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useLeadActivities = (leadId?: string) => {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!user?.id || !leadId) return;

    try {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedActivities = (data || []).map(activity => ({
        ...activity,
        activity_type: activity.activity_type as LeadActivity['activity_type'],
        activity_data: activity.activity_data || {}
      }));
      
      setActivities(typedActivities);
    } catch (error) {
      console.error('Error fetching lead activities:', error);
      toast({
        title: "Error",
        description: "Failed to load lead activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activity: Omit<LeadActivity, 'id' | 'professional_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          ...activity,
          professional_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchActivities();
      return data;
    } catch (error) {
      console.error('Error adding lead activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user?.id, leadId]);

  return {
    activities,
    loading,
    addActivity,
    refetchActivities: fetchActivities
  };
};
