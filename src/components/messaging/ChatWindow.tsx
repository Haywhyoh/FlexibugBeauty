
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, User, Sparkles, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender?: { full_name: string; avatar_url?: string };
}

interface AISuggestion {
  id: string;
  text: string;
  type: string;
}

interface ChatWindowProps {
  conversation: any;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, recipientId: string) => void;
  suggestions: AISuggestion[];
  onGenerateSuggestions: (content: string) => void;
  onClearSuggestions: () => void;
}

export const ChatWindow = ({ 
  conversation, 
  messages, 
  currentUserId, 
  onSendMessage,
  suggestions,
  onGenerateSuggestions,
  onClearSuggestions
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherPerson = conversation?.professional_id === currentUserId 
    ? conversation?.client 
    : conversation?.professional;

  const recipientId = conversation?.professional_id === currentUserId 
    ? conversation?.client_id 
    : conversation?.professional_id;

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && recipientId) {
      onSendMessage(newMessage.trim(), recipientId);
      setNewMessage("");
      onClearSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    setNewMessage(suggestion.text);
    onClearSuggestions();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate suggestions when receiving new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender_id !== currentUserId) {
      onGenerateSuggestions(lastMessage.content);
    }
  }, [messages, currentUserId, onGenerateSuggestions]);

  if (!conversation) {
    return (
      <Card className="flex-1 bg-white/70 backdrop-blur-sm flex items-center justify-center mx-4 lg:mx-0">
        <div className="text-center text-gray-500 p-6">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm sm:text-base">Select a conversation to start messaging</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 bg-white/70 backdrop-blur-sm flex flex-col mx-4 lg:mx-0">
      {/* Header */}
      <CardHeader className="border-b p-3 sm:p-6">
        <div className="flex items-center gap-3">
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
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {otherPerson?.full_name || 'Unknown User'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Online now</p>
          </div>
        </div>
      </CardHeader>
      
      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isCurrentUser ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-3 sm:px-4 py-2 border-t bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="text-sm font-medium text-purple-700">Suggested Replies</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                className="text-xs bg-white hover:bg-purple-100 border-purple-200 w-full sm:w-auto justify-start sm:justify-center"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="truncate">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="flex-1 text-sm"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 flex-shrink-0"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
