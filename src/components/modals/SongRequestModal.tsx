import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { SongRequestService } from '@/services/SongRequestService';

interface SongRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const SongRequestModal: React.FC<SongRequestModalProps> = ({ isOpen, onClose, isAdmin = false }) => {
  const { user } = useAuth();
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('עליך להתחבר כדי לשלוח בקשה לשיר');
      return;
    }

    if (!songName || !artistName) {
      toast.error('יש להזין את שם השיר ושם האמן');
      return;
    }

    setIsLoading(true);
    try {
      await SongRequestService.createSongRequest({
        user_id: user.id,
        song_name: songName,
        artist_name: artistName,
        notes: notes,
        created_by_name: user.user_metadata?.name || user.email
      });

      toast.success('בקשת השיר נשלחה בהצלחה');
      setSongName('');
      setArtistName('');
      setNotes('');
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
      <DialogContent className="max-w-md">
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
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="הזן את שם השיר"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">שם האמן</label>
            <Input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="הזן את שם האמן"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">הערות (אופציונלי)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות נוספות"
              dir="rtl"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !songName || !artistName}
            >
              {isLoading ? 'שולח...' : 'שלח בקשה'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SongRequestModal; 