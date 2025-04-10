import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PerksManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const PerksManagement: React.FC<PerksManagementProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // TODO: Implement perk management
      toast.success('הפרק עודכן בהצלחה');
      onClose();
    } catch (error) {
      console.error('Error managing perk:', error);
      toast.error('שגיאה בעדכון הפרק');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ניהול הטבות</DialogTitle>
          <DialogDescription>
            הוסף או ערוך הטבה חדשה
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">כותרת</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="הזן כותרת"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">תיאור</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="הזן תיאור"
              dir="rtl"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !title || !description}
            >
              {isLoading ? 'מעדכן...' : 'עדכן'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerksManagement; 