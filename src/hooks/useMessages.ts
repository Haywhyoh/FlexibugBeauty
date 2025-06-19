import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Handle potential null values from the join with explicit null checks
      const messagesWithSender = (data || []).map(msg => {
        let sender: { full_name: string; avatar_url?: string } | undefined = undefined;
        
        // Check sender with explicit null checks using type assertion to avoid TS errors
        const msgWithSender = msg as any;
        if (msgWithSender.sender !== null && 
            msgWithSender.sender !== undefined &&
            typeof msgWithSender.sender === 'object' && 
            'full_name' in msgWithSender.sender) {
          const senderData = msgWithSender.sender;
          if (senderData.full_name) {
            sender = { full_name: senderData.full_name, avatar_url: senderData.avatar_url };
          }
        }

        return {
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          content: msg.content,
          message_type: msg.message_type,
          is_read: msg.is_read,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          sender
        };
      });

      setMessages(messagesWithSender);

      // Mark messages as read
      if (user?.id) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', user.id)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, recipientId: string, messageType: string = 'text') => {
    if (!conversationId || !user?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          message_type: messageType
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
};
