
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Load initial messages
  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      setConnectionError(null);
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            text,
            created_at,
            sender_id,
            profiles:sender_id (
              name,
              avatar,
              id
            ),
            user_roles:sender_id (
              role
            )
          `)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        // Transform the data to match our Message type
        const formattedMessages = data.map((item: any): Message => {
          const isAdmin = item.user_roles?.some((r: any) => r.role === 'admin') || false;
          
          return {
            id: item.id,
            text: item.text,
            timestamp: new Date(item.created_at),
            isCurrentUser: item.sender_id === user.id,
            sender: {
              id: item.sender_id,
              name: item.profiles?.name || 'Unknown User',
              avatar: item.profiles?.avatar || '😊',
              isAdmin: isAdmin
            }
          };
        });
        
        setMessages(formattedMessages);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        setConnectionError('Failed to load messages. Please try again later.');
        toast.error('Failed to load chat messages');
      } finally {
        setIsLoading(false);
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
          
          // Fetch the complete message with sender details
          const { data, error } = await supabase
            .from('messages')
            .select(`
              id,
              text,
              created_at,
              sender_id,
              profiles:sender_id (
                name,
                avatar,
                id
              ),
              user_roles:sender_id (
                role
              )
            `)
            .eq('id', payload.new.id)
            .single();
            
          if (error) {
            console.error('Error fetching new message details:', error);
            return;
          }
          
          const isAdmin = data.user_roles?.some((r: any) => r.role === 'admin') || false;
          
          const newMessage: Message = {
            id: data.id,
            text: data.text,
            timestamp: new Date(data.created_at),
            isCurrentUser: data.sender_id === user.id,
            sender: {
              id: data.sender_id,
              name: data.profiles?.name || 'Unknown User',
              avatar: data.profiles?.avatar || '😊',
              isAdmin: isAdmin
            }
          };
          
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          sender_id: user.id
        });
      
      if (error) throw error;
      
      // Clear input field after sending
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
    handleInputChange,
    handleKeyDown,
    sendMessage
  };
};
