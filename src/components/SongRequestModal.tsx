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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.log('Submitting song request:', { songName, artistName, notes });
      
      await SongRequestService.createSongRequest({
        user_id: user.id,
        song_name: songName,
        artist_name: artistName,
        notes: notes,
        created_by_name: user.user_metadata?.name || user.email
      });

      console.log('Song request submitted successfully');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="songName" className="block text-sm font-medium mb-1">שם השיר</label>
            <Input
              id="songName"
              name="songName"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="הזן את שם השיר"
              dir="rtl"
              required
            />
          </div>
          <div>
            <label htmlFor="artistName" className="block text-sm font-medium mb-1">שם האמן</label>
            <Input
              id="artistName"
              name="artistName"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="הזן את שם האמן"
              dir="rtl"
              required
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">הערות (אופציונלי)</label>
            <Textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות נוספות"
              dir="rtl"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !songName || !artistName}
            >
              {isLoading ? 'שולח...' : 'שלח בקשה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SongRequestModal; 