import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_CREDENTIALS = {
  username: 'Butistaff',
  password: 'buti09*&'
};

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Set admin status in localStorage
        localStorage.setItem('buti_admin', 'true');
        toast.success('התחברת בהצלחה כמנהל');
        onSuccess();
        onClose();
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('שם משתמש או סיסמה שגויים');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right" dir="rtl">כניסת מנהל</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4" dir="rtl">
          <div className="space-y-2">
            <Label htmlFor="username">שם משתמש</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="הזן שם משתמש"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="הזן סיסמה"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 