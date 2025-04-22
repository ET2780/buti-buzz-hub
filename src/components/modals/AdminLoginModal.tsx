import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting admin login process...');
    
    try {
      console.log('Attempting to sign in with Supabase...');
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        setError(signInError.message);
        return;
      }

      if (!session) {
        console.error('No session returned from sign in');
        setError('Failed to create session');
        return;
      }

      console.log('Sign in successful, verifying admin role...');
      const response = await fetch('/supabase/functions/admin-auth', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({})
      });

      console.log('Admin auth response status:', response.status);
      const data = await response.json();
      console.log('Admin auth response data:', data);

      if (!response.ok) {
        console.error('Admin verification failed:', data.error);
        setError(data.error || 'Failed to verify admin role');
        return;
      }

      console.log('Admin verification successful, storing admin flag...');
      localStorage.setItem('isAdmin', 'true');
      console.log('Admin flag stored, navigating to chat...');
      navigate('/chat');
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>התחברות מנהל</DialogTitle>
          <DialogDescription>
            הזן את פרטי ההתחברות שלך כמנהל
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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