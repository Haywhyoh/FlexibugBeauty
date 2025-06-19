
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AISuggestion {
  id: string;
  text: string;
  type: 'scheduling' | 'pricing' | 'aftercare' | 'general';
}

export const useAISuggestions = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSuggestions = async (messageContent: string, conversationHistory: any[] = []) => {
    setLoading(true);
    
    try {
      // For demo purposes, we'll use predefined suggestions based on keywords
      // In a real implementation, this would call the OpenAI API
      const keywordSuggestions: Record<string, AISuggestion[]> = {
        'appointment': [
          { id: '1', text: "I have availability this Friday at 2 PM. Would that work for you?", type: 'scheduling' },
          { id: '2', text: "Let me check my calendar and get back to you with some options.", type: 'scheduling' },
          { id: '3', text: "What time works best for your schedule?", type: 'scheduling' }
        ],
        'price': [
          { id: '4', text: "The classic lash set is $120 and takes about 2 hours.", type: 'pricing' },
          { id: '5', text: "I'll send you my full price list with all service options.", type: 'pricing' },
          { id: '6', text: "Volume sets start at $150. Would you like more details?", type: 'pricing' }
        ],
        'aftercare': [
          { id: '7', text: "Keep your lashes dry for the first 24 hours for best results.", type: 'aftercare' },
          { id: '8', text: "I'll send you my complete aftercare guide via email.", type: 'aftercare' },
          { id: '9', text: "Use a lash brush daily and avoid oil-based products near your eyes.", type: 'aftercare' }
        ],
        'thank': [
          { id: '10', text: "You're so welcome! I can't wait to see you at your appointment.", type: 'general' },
          { id: '11', text: "Thank you for choosing me for your beauty needs! ✨", type: 'general' },
          { id: '12', text: "I'm so glad you're happy with the results!", type: 'general' }
        ]
      };

      const lowerMessage = messageContent.toLowerCase();
      let selectedSuggestions: AISuggestion[] = [];

      for (const [keyword, suggestionList] of Object.entries(keywordSuggestions)) {
        if (lowerMessage.includes(keyword)) {
          selectedSuggestions = suggestionList;
          break;
        }
      }

      // Default suggestions if no keywords match
      if (selectedSuggestions.length === 0) {
        selectedSuggestions = [
          { id: 'default1', text: "Thanks for reaching out! How can I help you today?", type: 'general' },
          { id: 'default2', text: "I'd be happy to answer any questions you have.", type: 'general' },
          { id: 'default3', text: "Let me know what you're looking for and I'll provide details.", type: 'general' }
        ];
      }

      setSuggestions(selectedSuggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    suggestions,
    loading,
    generateSuggestions,
    clearSuggestions
  };
};
