import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface PinnedMessage {
  id: string;
  message: string;
  created_at: string;
}

interface PinnedMessageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageUpdated: (messages: PinnedMessage[] | null) => void;
}

const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const PinnedMessageManager: React.FC<PinnedMessageManagerProps> = ({
  isOpen,
  onClose,
  onMessageUpdated
}) => {
  const [messages, setMessages] = useState<PinnedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching pinned messages...');
      const { data, error } = await adminClient
        .from('pinned_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched messages:', data);
      setMessages(data || []);
      if (typeof onMessageUpdated === 'function') {
        onMessageUpdated(data || null);
      }
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
      toast.error('שגיאה בטעינת ההודעות הנצמדות');
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('אנא הזן הודעה');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Adding new message:', newMessage);
      const { data, error } = await adminClient
        .from('pinned_messages')
        .insert([{ message: newMessage }])
        .select()
        .single();

      if (error) throw error;
      console.log('Added message:', data);

      const updatedMessages = [data, ...messages];
      setMessages(updatedMessages);
      setNewMessage('');
      
      if (typeof onMessageUpdated === 'function') {
        console.log('Calling onMessageUpdated with:', updatedMessages);
        onMessageUpdated(updatedMessages);
      }
      
      toast.success('ההודעה נוספה בהצלחה');
    } catch (error) {
      console.error('Error adding pinned message:', error);
      toast.error('שגיאה בהוספת ההודעה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('Deleting message:', id);
      const { error } = await adminClient
        .from('pinned_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedMessages = messages.filter(msg => msg.id !== id);
      setMessages(updatedMessages);
      
      if (typeof onMessageUpdated === 'function') {
        console.log('Calling onMessageUpdated with:', updatedMessages);
        onMessageUpdated(updatedMessages);
      }
      
      toast.success('ההודעה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting pinned message:', error);
      toast.error('שגיאה במחיקת ההודעה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMessage = async (id: string, updatedMessage: string) => {
    if (!updatedMessage.trim()) {
      toast.error('אנא הזן הודעה');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Updating message:', id, updatedMessage);
      const { data, error } = await adminClient
        .from('pinned_messages')
        .update({ message: updatedMessage })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('Updated message:', data);

      const updatedMessages = messages.map(msg => 
        msg.id === id ? data : msg
      );
      setMessages(updatedMessages);
      
      if (typeof onMessageUpdated === 'function') {
        console.log('Calling onMessageUpdated with:', updatedMessages);
        onMessageUpdated(updatedMessages);
      }
      
      toast.success('ההודעה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating pinned message:', error);
      toast.error('שגיאה בעדכון ההודעה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ניהול הודעות נצמדות</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="הוסף הודעה חדשה"
              dir="rtl"
            />
            <Button 
              onClick={handleAddMessage}
              disabled={isLoading}
            >
              הוסף
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div 
                key={message.id}
                className="flex items-center gap-2 p-2 border rounded-md"
              >
                <Input
                  value={message.message}
                  onChange={(e) => handleUpdateMessage(message.id, e.target.value)}
                  dir="rtl"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMessage(message.id)}
                  disabled={isLoading}
                >
                  מחק
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinnedMessageManager; 