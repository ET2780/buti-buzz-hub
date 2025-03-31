
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, User } from '@/types';

export const useRealtimeMessages = (
  user: User | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setConnectionError: React.Dispatch<React.SetStateAction<string | null>>,
  isSending: boolean
) => {
  const supabaseChannel = useRef<any>(null);
  
  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;
    
    // Create a channel for chat events
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          console.log('New message received:', payload);
          
          try {
            const messageData = payload.new;
            
            // Skip message processing if this is a message we just sent
            // This prevents duplicate messages in the UI
            if (messageData.sender_id === user.id && isSending) {
              console.log('Skipping own message during send operation');
              return;
            }
            
            // Fetch the sender details
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name, avatar, tags')
              .eq('id', messageData.sender_id)
              .maybeSingle();
              
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
                isAdmin: isAdmin,
                tags: profile ? profile.tags : []
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
      
    supabaseChannel.current = channel;
    
    // Clean up subscription
    return () => {
      if (supabaseChannel.current) {
        supabase.removeChannel(supabaseChannel.current);
      }
    };
  }, [user, isSending, setMessages, setConnectionError]);
};
