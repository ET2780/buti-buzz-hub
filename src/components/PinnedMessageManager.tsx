import React, { useState } from 'react';
import { Pin, Save, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

interface SystemMessage {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

interface PinnedMessageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPinnedMessage: string | null;
  onMessageUpdated: (message: string | null) => void;
}

const PinnedMessageManager: React.FC<PinnedMessageManagerProps> = ({
  isOpen,
  onClose,
  currentPinnedMessage,
  onMessageUpdated
}) => {
  const [message, setMessage] = useState(currentPinnedMessage || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!message.trim()) {
      handleDelete();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_messages')
        .upsert({ 
          id: 'pinned', 
          text: message.trim(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      onMessageUpdated(message.trim());
      toast.success('הודעה נעוצה עודכנה בהצלחה');
      onClose();
    } catch (error: PostgrestError | unknown) {
      console.error('Error saving pinned message:', error);
      toast.error('שגיאה בשמירת ההודעה');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_messages')
        .delete()
        .eq('id', 'pinned');
      
      if (error) throw error;
      
      onMessageUpdated(null);
      toast.success('הודעה נעוצה הוסרה בהצלחה');
      onClose();
    } catch (error: PostgrestError | unknown) {
      console.error('Error deleting pinned message:', error);
      toast.error('שגיאה במחיקת ההודעה');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            ניהול הודעה נעוצה
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">הודעה לנעיצה בראש הצ'אט</label>
            <Textarea
              placeholder="כתוב/י הודעה שתופיע בראש הצ'אט..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              הודעה זו תוצג באופן קבוע בראש הצ'אט לכל המשתמשים
            </p>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSaving || !currentPinnedMessage}
            className="gap-1"
          >
            <Trash size={16} />
            מחק הודעה נעוצה
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-1"
          >
            <Save size={16} />
            {isSaving ? 'שומר...' : 'שמור הודעה'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PinnedMessageManager;
