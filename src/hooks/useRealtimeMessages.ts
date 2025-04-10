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
    
    // Create a channel for chat events
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          try {
            // First, try to get the profile from the profiles table
            let profile;
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.sender_id)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              return;
            }

            profile = existingProfile;
            if (!profile) {
              console.warn(`No profile found for user ${payload.new.sender_id}`);
              return;
            }

            const isAdmin = profile.tags?.includes('admin') || false;
            const name = profile.name || 'אורח';
            const avatar = isAdmin ? '/buti-logo.png' : (profile.avatar || '😊');
            const tags = profile.tags || ['guest'];
            const customStatus = profile.custom_status || 'אורח';
            
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
                tags,
                customStatus,
                user_metadata: {
                  isTemporary: profile.is_temporary || false,
                  isAdmin,
                  name,
                  avatar,
                  tags,
                  customStatus,
                  permissions: {
                    canManagePerks: false,
                    canManageSongs: false,
                    canManagePinnedMessages: false,
                    canManageUsers: false,
                    canEditProfile: true,
                    canWriteMessages: true,
                    canSuggestSongs: true
                  }
                }
              }
            };

            setMessages(prev => [...prev, newMessage]);
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe();
      
    supabaseChannel.current = channel;
    
    // Clean up subscription
    return () => {
      if (supabaseChannel.current) {
        supabase.removeChannel(supabaseChannel.current);
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

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        // Create a map of profiles for quick lookup
        const profileMap = new Map(profiles.map(p => [p.id, p]));

        // Process messages with profile data
        const processedMessages = messages.map(message => {
          const profile = profileMap.get(message.sender_id);
          if (!profile) {
            console.warn(`No profile found for user ${message.sender_id}`);
            return null;
          }

          const isAdmin = profile.tags?.includes('admin') || false;
          const name = profile.name || 'אורח';
          const avatar = isAdmin ? '/buti-logo.png' : (profile.avatar || '😊');
          const tags = profile.tags || ['guest'];
          const customStatus = profile.custom_status || 'אורח';
          
          return {
            id: message.id,
            text: message.text,
            timestamp: new Date(message.created_at),
            isCurrentUser: message.sender_id === user.id,
            isAutomated: message.is_automated || false,
            sender: {
              id: profile.id,
              name,
              avatar,
              isAdmin,
              tags,
              customStatus,
              user_metadata: {
                isTemporary: profile.is_temporary || false,
                isAdmin,
                name,
                avatar,
                tags,
                customStatus,
                permissions: {
                  canManagePerks: false,
                  canManageSongs: false,
                  canManagePinnedMessages: false,
                  canManageUsers: false,
                  canEditProfile: true,
                  canWriteMessages: true,
                  canSuggestSongs: true
                }
              }
            }
          };
        }).filter(Boolean) as Message[];

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
      .channel('profiles')
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
                const name = payload.new.name || 'אורח';
                const avatar = isAdmin ? '/buti-logo.png' : (payload.new.avatar || '😊');
                const tags = payload.new.tags || ['guest'];
                const customStatus = payload.new.custom_status || 'אורח';
                
                return {
                  ...message,
                  sender: {
                    ...message.sender,
                    name,
                    avatar,
                    isAdmin,
                    tags,
                    customStatus,
                    user_metadata: {
                      isTemporary: true,
                      isAdmin,
                      name,
                      avatar,
                      tags,
                      customStatus,
                      permissions: {
                        canManagePerks: false,
                        canManageSongs: false,
                        canManagePinnedMessages: false,
                        canManageUsers: false,
                        canEditProfile: true,
                        canWriteMessages: true,
                        canSuggestSongs: true
                      }
                    }
                  }
                };
              }
              return message;
            }));
          } catch (error) {
            console.error('Error processing profile update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setMessages]);
};
