import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  professional_id: string;
  client_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  professional?: {
    full_name: string;
    avatar_url?: string;
  };
  client?: {
    full_name: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    sender_id: string;
  };
  unread_count?: number;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          professional:profiles!conversations_professional_id_fkey(full_name, avatar_url),
          client:profiles!conversations_client_id_fkey(full_name, avatar_url)
        `)
        .or(`professional_id.eq.${user.id},client_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          // Handle potential null values from the join with explicit null checks
          let professional: { full_name: string; avatar_url?: string } | undefined = undefined;
          let client: { full_name: string; avatar_url?: string } | undefined = undefined;

          // Check professional with explicit null checks using type assertion to avoid TS errors
          const convWithJoins = conv as any;
          if (convWithJoins.professional !== null && 
              convWithJoins.professional !== undefined &&
              typeof convWithJoins.professional === 'object' && 
              'full_name' in convWithJoins.professional) {
            const professionalData = convWithJoins.professional;

            if (professionalData.full_name) {
              professional = { full_name: professionalData.full_name, avatar_url: professionalData.avatar_url };
            }
          }
          
          // Check client with explicit null checks using type assertion to avoid TS errors
          if (convWithJoins.client !== null && 
              convWithJoins.client !== undefined &&
              typeof convWithJoins.client === 'object' && 
              'full_name' in convWithJoins.client) {
            const clientData = convWithJoins.client;
            if (clientData.full_name) {
              client = { full_name: clientData.full_name, avatar_url: clientData.avatar_url };
            }
          }

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

          return {
            id: conv.id,
            professional_id: conv.professional_id,
            client_id: conv.client_id,
            last_message_at: conv.last_message_at,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            professional,
            client,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (professionalId: string, clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          professional_id: professionalId,
          client_id: clientId
        })
        .select()
        .single();

      if (error) throw error;
      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription for conversations
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: user?.id ? `or(professional_id.eq.${user.id},client_id.eq.${user.id})` : undefined
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    conversations,
    loading,
    createConversation,
    refetch: fetchConversations
  };
};
