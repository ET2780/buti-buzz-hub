import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface PresenceUserInfo {
  user_id: string;
  user_name: string;
  avatar: string;
  is_admin: boolean;
  tags: string[];
  online_at: string;
}

export const useUserPresence = (user: User | null) => {
  const [activeChatUsers, setActiveChatUsers] = useState<User[]>([]);
  const presenceChannelRef = useRef<any>(null);
  
  // Set up user presence tracking
  useEffect(() => {
    if (!user) return;
    
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });
    
    presenceChannelRef.current = presenceChannel;
    
    // Track user's own presence
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const activeUsers = Object.keys(state).map(userId => {
          const userInfo = state[userId][0] as PresenceUserInfo;
          return {
            id: userId,
            name: userInfo.user_name || 'Unknown User',
            avatar: userInfo.avatar || '😊',
            isAdmin: userInfo.is_admin || false,
            tags: userInfo.tags || []
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
            user_name: user.user_metadata?.name || user.name,
            avatar: user.user_metadata?.avatar || user.avatar,
            is_admin: user.user_metadata?.isAdmin || false,
            tags: user.user_metadata?.tags || user.tags || [],
            online_at: new Date().toISOString(),
          });
        }
      });
      
    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdated = async (event: CustomEvent) => {
      const updatedUser = event.detail?.user;
      if (!updatedUser) return;

      // Update the active users list
      setActiveChatUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === updatedUser.id
            ? {
                ...u,
                name: updatedUser.user_metadata?.name || u.name,
                avatar: updatedUser.user_metadata?.avatar || u.avatar,
                tags: updatedUser.user_metadata?.tags || u.tags
              }
            : u
        )
      );

      // If the updated user is the current user, update their presence
      if (updatedUser.id === user?.id && presenceChannelRef.current) {
        const presenceChannel = presenceChannelRef.current;
        if (presenceChannel.subscriptionStatus === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: updatedUser.id,
            user_name: updatedUser.user_metadata?.name || updatedUser.name,
            avatar: updatedUser.user_metadata?.avatar || updatedUser.avatar,
            is_admin: updatedUser.user_metadata?.isAdmin || false,
            tags: updatedUser.user_metadata?.tags || updatedUser.tags || [],
            online_at: new Date().toISOString(),
          });
        }
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, [user]);
  
  return { activeChatUsers };
};
