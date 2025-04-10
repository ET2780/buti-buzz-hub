import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageUsersModal: React.FC<ManageUsersModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // TODO: Implement user management
      toast.success('המשתמש עודכן בהצלחה');
      onClose();
    } catch (error) {
      console.error('Error managing user:', error);
      toast.error('שגיאה בעדכון המשתמש');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ניהול משתמשים</DialogTitle>
          <DialogDescription>
            הוסף או ערוך משתמש
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם משתמש</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="הזן שם משתמש"
              dir="rtl"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !username}
            >
              {isLoading ? 'מעדכן...' : 'עדכן'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageUsersModal; 