
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { ConversationList } from "./messaging/ConversationList";
import { ChatWindow } from "./messaging/ChatWindow";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";

export const MessagesView = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversations, setShowConversations] = useState(true);
  
  const { conversations, loading: conversationsLoading } = useConversations();
  const { messages, sendMessage, loading: messagesLoading } = useMessages(selectedConversationId);
  const { suggestions, generateSuggestions, clearSuggestions } = useAISuggestions();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    clearSuggestions();
    setShowConversations(false); // Hide conversations on mobile when chat is selected
  };

  const handleBackToConversations = () => {
    setShowConversations(true);
    setSelectedConversationId(null);
    clearSuggestions();
  };

  const handleSendMessage = async (content: string, recipientId: string) => {
    await sendMessage(content, recipientId);
  };

  if (!user) {
    return (
      <div className="p-4 sm:p-6 text-center min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-gray-600">Please log in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b p-4">
        <div className="flex items-center gap-3">
          {!showConversations && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToConversations}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">
            {showConversations ? 'Messages' : selectedConversation ? 
              (selectedConversation.professional_id === user.id ? 
                selectedConversation.client?.full_name : 
                selectedConversation.professional?.full_name) || 'Chat' 
              : 'Chat'
            }
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Side by side layout */}
        <div className="hidden lg:flex w-full gap-6 p-6">
          {/* Conversations List - Desktop */}
          <div className="w-1/3 min-w-0">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              currentUserId={user.id}
            />
          </div>

          {/* Chat Window - Desktop */}
          <div className="flex-1 min-w-0">
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              suggestions={suggestions}
              onGenerateSuggestions={generateSuggestions}
              onClearSuggestions={clearSuggestions}
            />
          </div>
        </div>

        {/* Mobile: Stacked layout with conditional visibility */}
        <div className="lg:hidden flex-1 flex flex-col">
          {showConversations ? (
            <div className="flex-1 p-4">
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                currentUserId={user.id}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                currentUserId={user.id}
                onSendMessage={handleSendMessage}
                suggestions={suggestions}
                onGenerateSuggestions={generateSuggestions}
                onClearSuggestions={clearSuggestions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
