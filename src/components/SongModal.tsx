
import React, { useState } from 'react';
import { Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SongModal: React.FC<SongModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [songName, setSongName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (songName.trim()) {
      setSubmitting(true);
      // Simulate API request
      setTimeout(() => {
        toast.success('השיר נשלח בהצלחה!');
        setSongName('');
        setSubmitting(false);
        onClose();
      }, 800);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-buti-blue" />
            הצע/י שיר לפלייליסט של BUTI 🎶
          </DialogTitle>
          <DialogDescription>
            מה תרצה/י לשמוע בזמן שאת/ה נהנה/ית מהקפה שלך? אם זה מתאים לאווירה, יתכן שינוגן היום.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="שם השיר או קישור לספוטיפיי"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!songName.trim() || submitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {submitting ? 'שולח...' : 'הצע/י שיר'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongModal;
