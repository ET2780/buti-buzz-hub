import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useRealtimeProfiles = (setMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          console.log('Profile changed in realtime hook:', payload);
          const updatedProfile = payload.new;
          const profileTags = updatedProfile.tags || [];

          // Update any messages that use this profile
          setMessages(prevMessages => {
            console.log('Updating messages for user:', updatedProfile.id, 'with tags:', profileTags);
            
            // Create a fresh copy of the messages array to force React to detect the change
            const updatedMessages = prevMessages.map(message => {
              // If this message is from the user whose profile changed
              if (message.sender_id === updatedProfile.id) {
                console.log('Updating message sender:', message.sender_id);
                const updatedSender = {
                  ...message.sender,
                  name: updatedProfile.name || message.sender.name,
                  username: updatedProfile.name || message.sender.username,
                  avatar: updatedProfile.avatar || message.sender.avatar,
                  tags: profileTags,
                  customStatus: updatedProfile.custom_status,
                  isAdmin: profileTags.includes('admin'),
                  user_metadata: {
                    ...message.sender.user_metadata,
                    name: updatedProfile.name,
                    avatar: updatedProfile.avatar,
                    tags: profileTags,
                    customStatus: updatedProfile.custom_status,
                    isAdmin: profileTags.includes('admin'),
                    permissions: {
                      canManagePerks: profileTags.includes('admin'),
                      canManageSongs: profileTags.includes('admin'),
                      canManagePinnedMessages: profileTags.includes('admin'),
                      canManageUsers: profileTags.includes('admin'),
                      canEditProfile: true,
                      canWriteMessages: true,
                      canSuggestSongs: true
                    }
                  }
                };
                console.log('Updated sender:', updatedSender);
                
                // Create a fresh message object with new reference
                return {
                  ...message,
                  sender: updatedSender
                };
              }
              return {...message}; // Create fresh copies of all messages
            });
            
            return updatedMessages;
          });
          
          // Force a reload to ensure UI updates
          setForceUpdate(prev => prev + 1);
          
          // Dispatch profile update event with complete user data
          const updatedUser = {
            id: updatedProfile.id,
            name: updatedProfile.name,
            username: updatedProfile.name,
            avatar: updatedProfile.avatar,
            tags: profileTags,
            customStatus: updatedProfile.custom_status,
            isAdmin: profileTags.includes('admin'),
            user_metadata: {
              name: updatedProfile.name,
              avatar: updatedProfile.avatar,
              tags: profileTags,
              customStatus: updatedProfile.custom_status,
              isAdmin: profileTags.includes('admin'),
              permissions: {
                canManagePerks: profileTags.includes('admin'),
                canManageSongs: profileTags.includes('admin'),
                canManagePinnedMessages: profileTags.includes('admin'),
                canManageUsers: profileTags.includes('admin'),
                canEditProfile: true,
                canWriteMessages: true,
                canSuggestSongs: true
              }
            }
          };

          window.dispatchEvent(new CustomEvent('profile-updated', { 
            detail: { user: updatedUser }
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setMessages]);
}; 