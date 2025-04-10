import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useMessageSender() {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = async () => {
    if (!user?.id || !newMessage.trim()) return;

    setIsSending(true);
    try {
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar, tags, custom_status')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          text: newMessage.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    newMessage,
    isSending,
    handleInputChange,
    handleKeyDown,
    sendMessage
  };
}
