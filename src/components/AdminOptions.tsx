import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function AdminOptions() {
  const [isLoading, setIsLoading] = useState(false);

  const handleManagePerks = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement perk management
      toast.info('ניהול ההטבות יושק בקרוב!');
    } catch (error) {
      console.error('Error managing perks:', error);
      toast.error('אירעה שגיאה בניהול ההטבות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageUsers = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement user management
      toast.info('ניהול המשתמשים יושק בקרוב!');
    } catch (error) {
      console.error('Error managing users:', error);
      toast.error('אירעה שגיאה בניהול המשתמשים');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinMessage = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement message pinning
      toast.info('צירוף הודעה יושק בקרוב!');
    } catch (error) {
      console.error('Error pinning message:', error);
      toast.error('אירעה שגיאה בצירוף ההודעה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">אפשרויות מנהל</h2>
      
      <Card className="p-4 space-y-4">
        <Button
          className="w-full"
          onClick={handleManagePerks}
          disabled={isLoading}
        >
          ניהול הטבות
        </Button>
        
        <Button
          className="w-full"
          onClick={handleManageUsers}
          disabled={isLoading}
        >
          ניהול משתמשים
        </Button>
        
        <Button
          className="w-full"
          onClick={handlePinMessage}
          disabled={isLoading}
        >
          צירוף הודעה
        </Button>
      </Card>
    </div>
  );
} 