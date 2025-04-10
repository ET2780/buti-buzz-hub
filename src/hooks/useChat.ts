import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useRealtimeProfiles } from '@/hooks/useRealtimeProfiles';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useMessageSender } from '@/hooks/useMessageSender';

export const useChat = () => {
  const { user } = useAuth();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh when profile events occur
  useEffect(() => {
    const handleProfileUpdated = (event: CustomEvent) => {
      console.log('Profile update detected in useChat:', event.detail);
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, []);
  
  // Use our new smaller hooks
  const { messages, setMessages, isLoading, connectionError: fetchError } = useChatMessages(user, refreshKey);
  
  // Update connection error if fetch fails
  if (fetchError && !connectionError) {
    setConnectionError(fetchError);
  }
  
  const { newMessage, isSending, handleInputChange, handleKeyDown, sendMessage } = useMessageSender(user);
  
  // Set up realtime subscription to new messages
  useRealtimeMessages(user, setMessages, setConnectionError, isSending);
  
  // Set up realtime subscription to profile changes
  useRealtimeProfiles(setMessages);
  
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
    sendMessage,
    refreshKey
  };
};
