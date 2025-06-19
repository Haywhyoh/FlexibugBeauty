
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, User } from "lucide-react";
import { useState } from "react";

interface Conversation {
  id: string;
  professional_id: string;
  client_id: string;
  last_message_at: string;
  professional?: { full_name: string; avatar_url?: string };
  client?: { full_name: string; avatar_url?: string };
  last_message?: { content: string; sender_id: string };
  unread_count?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  currentUserId 
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter(conv => {
    const otherPerson = conv.professional_id === currentUserId ? conv.client : conv.professional;
    return otherPerson?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
  });

  const getOtherPerson = (conversation: Conversation) => {
    return conversation.professional_id === currentUserId 
      ? conversation.client 
      : conversation.professional;
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}m ago`;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-full bg-white/70 backdrop-blur-sm flex flex-col">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
          <span className="truncate">Messages</span>
          {conversations.length > 0 && (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {conversations.length}
            </Badge>
          )}
        </CardTitle>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 text-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="space-y-1">
          {filteredConversations.map((conversation) => {
            const otherPerson = getOtherPerson(conversation);
            
            return (
              <div
                key={conversation.id}
                className={`p-3 sm:p-4 cursor-pointer hover:bg-purple-50 active:bg-purple-100 transition-colors border-l-4 ${
                  selectedConversation === conversation.id 
                    ? 'bg-purple-100 border-purple-500' 
                    : 'border-transparent'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                    {otherPerson?.avatar_url ? (
                      <img 
                        src={otherPerson.avatar_url} 
                        alt={otherPerson.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(otherPerson?.full_name)
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                        {otherPerson?.full_name || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(conversation.last_message_at)}
                        </span>
                        {(conversation.unread_count || 0) > 0 && (
                          <Badge className="bg-purple-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 text-xs flex items-center justify-center p-0">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredConversations.length === 0 && (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <p className="text-sm sm:text-base">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
