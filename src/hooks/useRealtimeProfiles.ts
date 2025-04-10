import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useRealtimeProfiles = (setMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('realtime-profiles')
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
          
          // Ensure tags are properly processed - some DB operations might return them differently
          const profileTags = Array.isArray(updatedProfile.tags) ? updatedProfile.tags : [];
          console.log('Updated profile tags:', profileTags);
          console.log('Updated custom status:', updatedProfile.custom_status);
          
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
                  username: updatedProfile.name || message.sender.username,
                  avatar: updatedProfile.avatar || message.sender.avatar,
                  tags: profileTags,
                  customStatus: updatedProfile.custom_status,
                  user_metadata: {
                    ...message.sender.user_metadata,
                    name: updatedProfile.name,
                    avatar: updatedProfile.avatar,
                    tags: profileTags,
                    customStatus: updatedProfile.custom_status
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
          
          // Dispatch profile update event
          window.dispatchEvent(new CustomEvent('profile-updated', { 
            detail: { 
              user: {
                id: updatedProfile.id,
                username: updatedProfile.name,
                avatar: updatedProfile.avatar,
                tags: profileTags,
                customStatus: updatedProfile.custom_status,
                user_metadata: {
                  name: updatedProfile.name,
                  avatar: updatedProfile.avatar,
                  tags: profileTags,
                  customStatus: updatedProfile.custom_status
                }
              }
            } 
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setMessages]);
}; 