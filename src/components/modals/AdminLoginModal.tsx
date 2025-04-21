import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting to sign in with Supabase...');
      // First try to sign in with Supabase
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', { signInData, signInError });
      
      if (signInError) {
        throw new Error('Invalid credentials');
      }

      // Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);

      if (!session) {
        throw new Error('No session found');
      }

      // Then verify admin role
      console.log('Verifying admin role...');
      const response = await fetch('https://bgrpkdtlnlxifdlqrcay.supabase.co/functions/v1/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      console.log('Admin auth response status:', response.status);
      const data = await response.json();
      console.log('Admin auth response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Not authorized as admin');
      }

      // Set admin flag in localStorage
      localStorage.setItem('buti_admin', 'true');
      
      toast.success('התחברת בהצלחה כמנהל');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('שם משתמש או סיסמה שגויים');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>התחברות כמנהל</DialogTitle>
          <DialogDescription>
            הזן את פרטי ההתחברות שלך כמנהל המערכת
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="הזן אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
            <Input
              type="password"
              placeholder="הזן סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 