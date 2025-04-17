import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

export function useMessageSender(user: User | null) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = async () => {
    if (!user?.id || !newMessage.trim()) return;

    console.log('Sending message:', newMessage);
    setIsSending(true);
    try {
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar, tags, custom_status')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      console.log('Profile found:', profile);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          text: newMessage.trim(),
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
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
