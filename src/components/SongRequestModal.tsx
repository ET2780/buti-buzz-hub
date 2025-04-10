import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SongRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const SongRequestModal: React.FC<SongRequestModalProps> = ({ isOpen, onClose, isAdmin = false }) => {
  const { user } = useAuth();
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // TODO: Implement song request submission
      toast.success('בקשת השיר נשלחה בהצלחה');
      onClose();
    } catch (error) {
      console.error('Error submitting song request:', error);
      toast.error('שגיאה בשליחת בקשת השיר');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isAdmin ? 'ניהול בקשות לשירים' : 'הצע/י שיר'}
          </DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? 'ניהול בקשות השירים שהתקבלו'
              : 'הזן את פרטי השיר שברצונך להציע'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם השיר</label>
            <Input
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="הזן את שם השיר"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">שם האמן</label>
            <Input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="הזן את שם האמן"
              dir="rtl"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !songTitle || !artist}
            >
              {isLoading ? 'שולח...' : 'שלח'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SongRequestModal; 