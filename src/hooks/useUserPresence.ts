
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useUserPresence = (user: User | null) => {
  const [activeChatUsers, setActiveChatUsers] = useState<User[]>([]);
  
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
            user_name: user.name,
            avatar: user.avatar,
            is_admin: user.isAdmin,
            tags: user.tags || [],
            online_at: new Date().toISOString(),
          });
        }
      });
      
    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);
  
  return { activeChatUsers };
};
