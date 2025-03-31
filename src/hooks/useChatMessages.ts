
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, User } from '@/types';
import { toast } from 'sonner';

export const useChatMessages = (user: User | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const fetchAttempts = useRef(0);
  
  // Load initial messages
  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      setConnectionError(null);
      
      try {
        // First, fetch all messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, text, created_at, sender_id')
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        // Then, fetch all profiles to match with sender_ids
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar, tags');
          
        if (profilesError) throw profilesError;
        
        // Also fetch roles to determine admin status
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
          
        if (rolesError) throw rolesError;
        
        // Create a map of profiles for quick lookup
        const profilesMap = profilesData.reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        
        // Create a map of admin roles
        const adminMap: Record<string, boolean> = {};
        rolesData.forEach((roleData: any) => {
          if (roleData.role === 'admin') {
            adminMap[roleData.user_id] = true;
          }
        });
        
        // Transform the data to match our Message type
        const formattedMessages = messagesData.map((message: any): Message => {
          const profile = profilesMap[message.sender_id] || {};
          const isAdmin = adminMap[message.sender_id] || false;
          
          return {
            id: message.id,
            text: message.text,
            timestamp: new Date(message.created_at),
            isCurrentUser: message.sender_id === user.id,
            sender: {
              id: message.sender_id,
              name: profile.name || 'Unknown User',
              avatar: profile.avatar || '😊',
              isAdmin: isAdmin,
              tags: profile.tags || []
            }
          };
        });
        
        setMessages(formattedMessages);
        fetchAttempts.current = 0; // Reset attempts on success
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        
        fetchAttempts.current += 1;
        if (fetchAttempts.current < 3) {
          // Retry up to 3 times
          console.log(`Retrying fetch messages (attempt ${fetchAttempts.current})...`);
          setTimeout(fetchMessages, 2000); // Retry after 2 seconds
          return; // Don't update loading state yet
        } else {
          setConnectionError('Failed to load messages. Please try again later.');
          toast.error('Failed to load chat messages');
        }
      } finally {
        if (fetchAttempts.current >= 3 || fetchAttempts.current === 0) {
          setIsLoading(false); // Only set loading to false if we're not retrying
        }
      }
    };
    
    fetchMessages();
  }, [user]);
  
  return {
    messages,
    setMessages,
    isLoading,
    connectionError,
  };
};
