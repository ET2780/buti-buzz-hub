
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';
import { validate as isUuid } from 'uuid';

export const useMessageSender = (user: User | null) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Helper function to ensure user profile exists
  const ensureUserProfileExists = async (user: User) => {
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      // If profile doesn't exist, create one
      if (!existingProfile) {
        console.log("Creating profile for user:", user.id);
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            tags: user.tags || []
          });
      }
    } catch (error) {
      console.error("Error checking/creating profile:", error);
      // Continue anyway since we've removed the foreign key constraint
      // This shouldn't block message sending
    }
  };
  
  const sendMessage = async () => {
    if (!user || !newMessage.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      console.log("Sending message as user:", user.id);
      
      // Validate UUID properly, using the uuid package validator
      if (!user.id || !isUuid(user.id)) {
        console.error("Invalid UUID format for user ID:", user.id);
        throw new Error("Invalid user ID. Please try logging in again.");
      }
      
      // Ensure user profile exists in the database for demo users
      await ensureUserProfileExists(user);
      
      // Now send the message
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          sender_id: user.id
        });
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      // Clear input field after sending
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
};
