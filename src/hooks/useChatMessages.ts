import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, User } from '@/types';
import { toast } from 'sonner';

interface MessageData {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  is_temporary: boolean;
  is_automated?: boolean;
}

interface ProfileData {
  id: string;
  name: string;
  avatar: string;
  tags: string[];
  custom_status?: string;
}

export const useChatMessages = (user: User | null, refreshKey: number = 0) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const fetchAttempts = useRef(0);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      setConnectionError(null);
      
      try {
        console.log('Fetching messages...');
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, text, created_at, sender_id')
          .order('created_at', { ascending: true });
        
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          throw messagesError;
        }
        
        console.log('Messages fetched:', messagesData);
        
        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar, tags, custom_status');
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }
        
        console.log('Profiles fetched:', profilesData);
        
        // Create maps for quick lookups
        const profilesMap = profilesData.reduce((acc: Record<string, ProfileData>, profile: ProfileData) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        
        // Format messages
        const formattedMessages = messagesData.map((message: MessageData): Message => {
          const profile = profilesMap[message.sender_id];
          const isAdmin = profile?.tags?.includes('admin') || false;
          
          return {
            id: message.id,
            text: message.text,
            timestamp: new Date(message.created_at),
            isCurrentUser: message.sender_id === user.id,
            isAutomated: false,
            sender: {
              id: message.sender_id,
              name: isAdmin ? (profile?.name || 'Admin') : (profile?.name || 'אורח'),
              avatar: isAdmin ? '/buti-logo.png' : (profile?.avatar || '😊'),
              isAdmin,
              tags: profile?.tags || [],
              customStatus: profile?.custom_status || '',
              user_metadata: {
                name: isAdmin ? (profile?.name || 'Admin') : (profile?.name || 'אורח'),
                avatar: isAdmin ? '/buti-logo.png' : (profile?.avatar || '😊'),
                tags: profile?.tags || [],
                customStatus: profile?.custom_status || '',
                permissions: {
                  isAdmin
                }
              }
            }
          };
        });
        
        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages);
        fetchAttempts.current = 0;
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        
        fetchAttempts.current += 1;
        if (fetchAttempts.current < 3) {
          console.log(`Retrying fetch (attempt ${fetchAttempts.current})...`);
          setTimeout(fetchMessages, 2000);
          return;
        } else {
          setConnectionError('Failed to load messages');
          toast.error('Failed to load chat messages');
        }
      } finally {
        if (fetchAttempts.current >= 3 || fetchAttempts.current === 0) {
          setIsLoading(false);
        }
      }
    };
    
    fetchMessages();
  }, [user, refreshKey]);
  
  // Listen for profile updates and update messages accordingly
  useEffect(() => {
    const handleProfileUpdated = (event: CustomEvent) => {
      const updatedUser = event.detail?.user;
      if (!updatedUser) return;
      
      setMessages(prevMessages => 
        prevMessages.map(message => {
          if (message.sender.id === updatedUser.id) {
            const isAdmin = updatedUser.user_metadata?.permissions?.isAdmin || message.sender.isAdmin;
            return {
              ...message,
              sender: {
                ...message.sender,
                name: isAdmin ? (updatedUser.user_metadata?.name || 'Admin') : (updatedUser.user_metadata?.name || message.sender.name),
                avatar: isAdmin ? '/buti-logo.png' : (updatedUser.user_metadata?.avatar || message.sender.avatar),
                tags: updatedUser.user_metadata?.tags || message.sender.tags,
                customStatus: updatedUser.user_metadata?.customStatus || message.sender.customStatus,
                isAdmin,
                user_metadata: {
                  ...message.sender.user_metadata,
                  name: isAdmin ? (updatedUser.user_metadata?.name || 'Admin') : (updatedUser.user_metadata?.name || message.sender.name),
                  avatar: isAdmin ? '/buti-logo.png' : (updatedUser.user_metadata?.avatar || message.sender.avatar),
                  tags: updatedUser.user_metadata?.tags || message.sender.tags,
                  customStatus: updatedUser.user_metadata?.customStatus || message.sender.customStatus,
                  permissions: {
                    isAdmin
                  }
                }
              }
            };
          }
          return message;
        })
      );
    };
    
    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, []);
  
  return {
    messages,
    setMessages,
    isLoading,
    connectionError,
  };
};
