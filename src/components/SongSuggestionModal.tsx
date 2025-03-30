
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

interface SongSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (songName: string) => void;
}

const SongSuggestionModal: React.FC<SongSuggestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [songName, setSongName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (songName.trim()) {
      setSubmitting(true);
      // Simulate API request
      setTimeout(() => {
        onSubmit(songName);
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
            Suggest a Song for the BUTI Playlist 🎶
          </DialogTitle>
          <DialogDescription>
            What would you like to hear while enjoying your coffee? If it fits the vibe, it may play today.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Song name or Spotify link"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!songName.trim() || submitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {submitting ? 'Submitting...' : 'Suggest Song'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongSuggestionModal;
