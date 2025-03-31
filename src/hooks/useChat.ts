
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useMessageSender } from '@/hooks/useMessageSender';

export const useChat = () => {
  const { user } = useAuth();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Use our new smaller hooks
  const { messages, setMessages, isLoading, connectionError: fetchError } = useChatMessages(user);
  
  // Update connection error if fetch fails
  if (fetchError && !connectionError) {
    setConnectionError(fetchError);
  }
  
  const { newMessage, isSending, handleInputChange, handleKeyDown, sendMessage } = useMessageSender(user);
  
  // Set up realtime subscription to new messages
  useRealtimeMessages(user, setMessages, setConnectionError, isSending);
  
  // Track user presence
  const { activeChatUsers } = useUserPresence(user);
  
  return {
    messages,
    newMessage,
    isLoading,
    connectionError,
    isSending,
    activeChatUsers,
    handleInputChange,
    handleKeyDown,
    sendMessage
  };
};
