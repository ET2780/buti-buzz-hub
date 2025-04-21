import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, User } from '@/types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface MessageData {
  id: string;
  text: string;
  created_at: string;
  sender_id: string;
  is_temporary: boolean;
  is_automated?: boolean;
}

interface ProfileData {
  name: string;
  avatar: string;
  tags: string[];
}

export const useRealtimeMessages = (
  user: User | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setConnectionError: React.Dispatch<React.SetStateAction<string | null>>,
  isSending: boolean
) => {
  const supabaseChannel = useRef<RealtimeChannel | null>(null);
  
  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up real-time subscription for user:', user.id);
    
    // Clean up any existing channel
    if (supabaseChannel.current) {
      console.log('Cleaning up existing channel');
      supabase.removeChannel(supabaseChannel.current);
    }
    
    // Create a channel for chat events
    const channel = supabase
      .channel(`messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          console.log('New message received:', payload);
          
          try {
            // For automated messages, use the sender metadata directly
            if (payload.new.is_automated) {
              const senderMetadata = payload.new.sender_metadata;
              const newMessage: Message = {
                id: payload.new.id,
                text: payload.new.text,
                timestamp: new Date(payload.new.created_at),
                isCurrentUser: payload.new.sender_id === user.id,
                isAutomated: true,
                sender: {
                  id: payload.new.sender_id,
                  name: senderMetadata.name || 'Admin',
                  avatar: senderMetadata.avatar || '/buti-logo.png',
                  isAdmin: true,
                  tags: ['admin'],
                  customStatus: '',
                  user_metadata: {
                    name: senderMetadata.name || 'Admin',
                    avatar: senderMetadata.avatar || '/buti-logo.png',
                    tags: ['admin'],
                    customStatus: '',
                    permissions: {
                      isAdmin: true
                    }
                  }
                }
              };

              console.log('Adding automated message to state:', newMessage);
              setMessages(prev => {
                console.log('Previous messages:', prev);
                const updated = [...prev, newMessage];
                console.log('Updated messages:', updated);
                return updated;
              });
              return;
            }

            // For regular messages, fetch the profile as before
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.sender_id)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              return;
            }

            console.log('Profile found:', profile);

            if (profile) {
              const isAdmin = profile.tags?.includes('admin') || profile.user_metadata?.permissions?.isAdmin || false;
              
              // Use the most up-to-date profile data without fallback to temporary names
              const name = profile.name || profile.user_metadata?.name || '';
              const avatar = isAdmin ? '/buti-logo.png' : (profile.avatar || profile.user_metadata?.avatar || '😊');

              const newMessage: Message = {
                id: payload.new.id,
                text: payload.new.text,
                timestamp: new Date(payload.new.created_at),
                isCurrentUser: payload.new.sender_id === user.id,
                isAutomated: payload.new.is_automated || false,
                sender: {
                  id: profile.id,
                  name,
                  avatar,
                  isAdmin,
                  tags: profile.tags || [],
                  customStatus: profile.custom_status || profile.user_metadata?.customStatus || '',
                  user_metadata: {
                    name,
                    avatar,
                    tags: profile.tags || [],
                    customStatus: profile.custom_status || profile.user_metadata?.customStatus || '',
                    permissions: {
                      isAdmin
                    }
                  }
                }
              };

              console.log('Adding new message to state:', newMessage);
              setMessages(prev => {
                console.log('Previous messages:', prev);
                const updated = [...prev, newMessage];
                console.log('Updated messages:', updated);
                return updated;
              });
            }
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
        console.log('Cleaning up channel');
        supabase.removeChannel(supabaseChannel.current);
        supabaseChannel.current = null;
      }
    };
  }, [user, setMessages, setConnectionError]);

  // Load initial messages
  useEffect(() => {
    if (!user) return;

    const loadInitialMessages = async () => {
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Fetch all unique sender profiles
        const senderIds = [...new Set(messages.map(m => m.sender_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', senderIds);

        if (profilesError) throw profilesError;

        // Create a map of profiles for quick lookup
        const profileMap = new Map(profiles.map(p => [p.id, p]));

        // Process messages with profile data
        const processedMessages = messages.map(message => {
          const profile = profileMap.get(message.sender_id);
          const isAdmin = profile?.tags?.includes('admin') || false;
          
          // Use the most up-to-date profile data without fallback to temporary names
          const name = profile?.name || profile?.user_metadata?.name || '';
          const avatar = isAdmin ? '/buti-logo.png' : (profile?.avatar || profile?.user_metadata?.avatar || '😊');

          return {
            id: message.id,
            text: message.text,
            timestamp: new Date(message.created_at),
            isCurrentUser: message.sender_id === user.id,
            isAutomated: message.is_automated || false,
            sender: {
              id: profile?.id || message.sender_id,
              name,
              avatar,
              isAdmin,
              tags: profile?.tags || [],
              customStatus: profile?.custom_status || profile?.user_metadata?.customStatus || '',
              user_metadata: {
                name,
                avatar,
                tags: profile?.tags || [],
                customStatus: profile?.custom_status || profile?.user_metadata?.customStatus || '',
                permissions: {
                  isAdmin
                }
              }
            }
          };
        });

        setMessages(processedMessages);
      } catch (error) {
        console.error('Error loading initial messages:', error);
        setConnectionError('Failed to load messages. Please try refreshing the page.');
      }
    };

    loadInitialMessages();
  }, [user, setMessages, setConnectionError]);

  // Subscribe to profile updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profiles-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          try {
            // Update messages with the new profile data
            setMessages(prev => prev.map(message => {
              if (message.sender.id === payload.new.id) {
                const isAdmin = payload.new.tags?.includes('admin') || false;
                
                // Use the most up-to-date profile data without fallback to temporary names
                const name = payload.new.name || payload.new.user_metadata?.name || '';
                const avatar = isAdmin ? '/buti-logo.png' : (payload.new.avatar || payload.new.user_metadata?.avatar || '😊');

                return {
                  ...message,
                  sender: {
                    ...message.sender,
                    name,
                    avatar,
                    isAdmin,
                    tags: payload.new.tags || [],
                    customStatus: payload.new.custom_status || payload.new.user_metadata?.customStatus || '',
                    user_metadata: {
                      name,
                      avatar,
                      tags: payload.new.tags || [],
                      customStatus: payload.new.custom_status || payload.new.user_metadata?.customStatus || '',
                      permissions: {
                        isAdmin
                      }
                    }
                  }
                };
              }
              return message;
            }));
          } catch (error) {
            console.error('Error updating messages with profile changes:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setMessages]);
};
