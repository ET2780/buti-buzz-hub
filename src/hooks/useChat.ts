
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message, User } from '@/types';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { toast } from 'sonner';

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
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
          .select('id, name, avatar');
          
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
              isAdmin: isAdmin
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
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          console.log('New message received:', payload);
          
          try {
            const messageData = payload.new;
            
            // Fetch the sender details
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name, avatar')
              .eq('id', messageData.sender_id)
              .single();
              
            if (profileError) throw profileError;
            
            // Fetch if user is admin
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', messageData.sender_id);
              
            const isAdmin = roleData && roleData.some((r: any) => r.role === 'admin') || false;
            
            const newMessage: Message = {
              id: messageData.id,
              text: messageData.text,
              timestamp: new Date(messageData.created_at),
              isCurrentUser: messageData.sender_id === user.id,
              sender: {
                id: messageData.sender_id,
                name: profile ? profile.name : 'Unknown User',
                avatar: profile ? profile.avatar : '😊',
                isAdmin: isAdmin
              }
            };
            
            setMessages((prev) => [...prev, newMessage]);
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to messages');
          setConnectionError('Failed to connect to chat. Please try refreshing the page.');
        }
      });
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const sendMessage = async () => {
    if (!user || !newMessage.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      console.log("Sending message as user:", user.id);
      
      // Validate UUID properly, using the uuid package validator
      if (!user.id || !isUuid(user.id)) {
        console.error("Invalid UUID format for user ID:", user.id);
        throw new Error("Invalid user ID. Please try logging in again.");
      }
      
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          sender_id: user.id // Now guaranteed to be a valid UUID
        });
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      // Clear input field after sending
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  return {
    messages,
    newMessage,
    isLoading,
    connectionError,
    isSending,
    handleInputChange,
    handleKeyDown,
    sendMessage
  };
};
