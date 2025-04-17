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
import { useAuth } from '@/hooks/useAuth';
import { SongRequestService } from '@/services/SongRequestService';

interface SongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SongModal: React.FC<SongModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [songName, setSongName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('עליך להתחבר כדי לשלוח בקשה לשיר');
      return;
    }

    if (!songName.trim()) {
      toast.error('יש להזין את שם השיר');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting song request...');
      await SongRequestService.createSongRequest({
        user_id: user.id,
        song_name: songName.trim()
      });
      toast.success('השיר נשלח בהצלחה!');
      setSongName('');
      onClose();
    } catch (error) {
      console.error('Error submitting song request:', error);
      toast.error('שגיאה בשליחת בקשת השיר');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">הצע/י שיר לפלייליסט של BUTI 🎶</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="songName" className="block text-sm font-medium text-gray-700 mb-1">
              שם השיר או קישור לספוטיפיי
            </label>
            <input
              type="text"
              id="songName"
              name="songName"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter song name"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'שולח...' : 'הצע/י שיר'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongModal;
