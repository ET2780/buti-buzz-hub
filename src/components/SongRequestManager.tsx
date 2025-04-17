import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { SongRequestService, SongRequest } from '@/services/SongRequestService';
import { useChat } from '@/hooks/useChat';

interface SongRequestManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SongRequestManager: React.FC<SongRequestManagerProps> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useChat();

  const loadRequests = async () => {
    try {
      console.log('Loading song requests...');
      setIsLoading(true);
      const data = await SongRequestService.getRecentRequests();
      console.log('Loaded song requests:', data);
      setRequests(data);
    } catch (error) {
      console.error('Error loading song requests:', error);
      toast.error('שגיאה בטעינת בקשות השירים');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('Song request manager opened, loading requests...');
      loadRequests();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('Setting up song request subscription...');
    const unsubscribe = SongRequestService.subscribeToSongRequests((payload) => {
      console.log('Received song request update:', payload);
      loadRequests();
    });

    return () => {
      console.log('Cleaning up song request subscription...');
      unsubscribe();
    };
  }, []);

  const handleApprove = async (request: SongRequest) => {
    try {
      console.log('Approving song request:', request);
      await SongRequestService.approveSongRequest(request.id, request.created_by_name || 'משתמש');
      
      // Send a message to the chat
      const message = `🎵 השיר "${request.song_name}" מאת ${request.artist_name} התקבל! (הוצע ע"י ${request.created_by_name || 'משתמש'})`;
      await sendMessage(message);
      
      // Remove the approved request from the list
      setRequests(requests.filter(r => r.id !== request.id));
      
      toast.success('בקשת השיר אושרה');
    } catch (error) {
      console.error('Error approving song request:', error);
      toast.error('שגיאה באישור בקשת השיר');
    }
  };

  const handleReject = async (request: SongRequest) => {
    try {
      console.log('Rejecting song request:', request);
      await SongRequestService.rejectSongRequest(request.id);
      // Remove the rejected request from the list
      setRequests(requests.filter(r => r.id !== request.id));
      toast.success('בקשת השיר נדחתה');
    } catch (error) {
      console.error('Error rejecting song request:', error);
      toast.error('שגיאה בדחיית בקשת השיר');
    }
  };

  const handleDelete = async (request: SongRequest) => {
    try {
      console.log('Deleting song request:', request);
      await SongRequestService.deleteSongRequest(request.id);
      // Remove the deleted request from the list
      setRequests(requests.filter(r => r.id !== request.id));
      toast.success('בקשת השיר נמחקה');
    } catch (error) {
      console.error('Error deleting song request:', error);
      toast.error('שגיאה במחיקת בקשת השיר');
    }
  };

  // Clear old requests at the end of the day
  useEffect(() => {
    const clearOldRequests = async () => {
      try {
        console.log('Clearing old song requests...');
        await SongRequestService.clearOldRequests();
        loadRequests();
      } catch (error) {
        console.error('Error clearing old requests:', error);
      }
    };

    // Set up a daily check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      clearOldRequests();
      // Set up the next check for the following day
      setInterval(clearOldRequests, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">ניהול בקשות שירים</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              טוען בקשות...
            </div>
          ) : requests.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              אין בקשות שירים חדשות
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="text-center">
                  <CardHeader>
                    <CardTitle className="text-lg text-center">
                      <span dir="auto">{request.song_name}</span>
                    </CardTitle>
                    <CardDescription className="text-center">
                      <span dir="auto">מאת {request.artist_name}</span>
                    </CardDescription>
                  </CardHeader>
                  {request.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center" dir="auto">
                        {request.notes}
                      </p>
                    </CardContent>
                  )}
                  <CardFooter className="flex justify-center gap-2">
                    <Button
                      variant="default"
                      onClick={() => handleApprove(request)}
                    >
                      אישור
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(request)}
                    >
                      דחייה
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(request)}
                    >
                      מחיקה
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SongRequestManager; 