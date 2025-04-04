
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePinnedMessage = () => {
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  
  // Fetch pinned message when component mounts
  useEffect(() => {
    const fetchPinnedMessage = async () => {
      try {
        // Explicitly type the response data
        const { data, error } = await supabase
          .from('system_messages' as any)
          .select('text')
          .eq('id', 'pinned')
          .maybeSingle();
          
        if (error) throw error;
        
        // Comprehensive null checking to fix TypeScript errors
        if (data && 'text' in data && typeof data.text === 'string') {
          setPinnedMessage(data.text);
        } else {
          // If no data is found, ensure pinnedMessage is null
          setPinnedMessage(null);
        }
      } catch (error) {
        console.error('Error fetching pinned message:', error);
        setPinnedMessage(null);
      }
    };
    
    fetchPinnedMessage();
  }, []);

  // Set up subscription to system_messages table for real-time updates
  useEffect(() => {
    const systemChannel = supabase
      .channel('system-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_messages' },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          if (newData && newData.id === 'pinned' && typeof newData.text === 'string') {
            setPinnedMessage(newData.text);
          } else if (payload.eventType === 'DELETE' && oldData && oldData.id === 'pinned') {
            setPinnedMessage(null);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(systemChannel);
    };
  }, []);

  return { pinnedMessage, setPinnedMessage };
};
