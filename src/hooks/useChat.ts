
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
  const [activeChatUsers, setActiveChatUsers] = useState<User[]>([]);
  const fetchAttempts = useRef(0);
  const supabaseChannel = useRef<any>(null);
  
  // Set up real-time subscription for new messages and user presence
  useEffect(() => {
    if (!user) return;
    
    const setupRealtimeSubscription = () => {
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
                .select('name, avatar')
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
        
      supabaseChannel.current = channel;
      
      // Also set up presence channel for active users
      setupUserPresence();
    };
    
    // Set up user presence tracking
    const setupUserPresence = () => {
      if (!user) return;
      
      const presenceChannel = supabase.channel('online-users', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });
      
      // Track user's own presence
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const activeUsers = Object.keys(state).map(userId => {
            const userInfo = state[userId][0] as any;
            return {
              id: userId,
              name: userInfo.user_name || 'Unknown User',
              avatar: userInfo.avatar || '😊',
              isAdmin: userInfo.is_admin || false,
            };
          });
          
          setActiveChatUsers(activeUsers);
          console.log('Active users updated:', activeUsers);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // When subscribed, broadcast presence
            await presenceChannel.track({
              user_id: user.id,
              user_name: user.name,
              avatar: user.avatar,
              is_admin: user.isAdmin,
              online_at: new Date().toISOString(),
            });
          }
        });
    };
    
    // Load initial messages
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
    setupRealtimeSubscription();
    
    // Clean up subscription
    return () => {
      if (supabaseChannel.current) {
        supabase.removeChannel(supabaseChannel.current);
      }
    };
  }, [user, isSending]);
  
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
      
      // Ensure user profile exists in the database for demo users
      await ensureUserProfileExists(user);
      
      // Now send the message
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          sender_id: user.id
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
  
  // Helper function to ensure user profile exists
  const ensureUserProfileExists = async (user: User) => {
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      // If profile doesn't exist, create one
      if (!existingProfile) {
        console.log("Creating profile for user:", user.id);
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.name,
            avatar: user.avatar
          });
      }
    } catch (error) {
      console.error("Error checking/creating profile:", error);
      // Continue anyway since we've removed the foreign key constraint
      // This shouldn't block message sending
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
    activeChatUsers,
    handleInputChange,
    handleKeyDown,
    sendMessage
  };
};
