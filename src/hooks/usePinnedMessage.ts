import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SystemMessage {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export const usePinnedMessage = () => {
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  
  // Fetch pinned message when component mounts
  useEffect(() => {
    const fetchPinnedMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('system_messages')
          .select('text')
          .eq('id', 'pinned')
          .maybeSingle();
          
        if (error) throw error;
        
        if (data && 'text' in data && typeof data.text === 'string') {
          setPinnedMessage(data.text);
        } else {
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
        (payload: RealtimePostgresChangesPayload<SystemMessage>) => {
          const newData = payload.new;
          const oldData = payload.old;
          
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
