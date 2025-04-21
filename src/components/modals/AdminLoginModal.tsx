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
        console.error('Sign in error:', signInError);
        throw new Error(signInError.message || 'Invalid credentials');
      }

      // Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);

      if (!session) {
        console.error('No session found after sign in');
        throw new Error('No session found');
      }

      // Then verify admin role
      console.log('Verifying admin role...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }
      
      const adminAuthUrl = `${supabaseUrl}/functions/v1/admin-auth`;
      console.log('Admin auth URL:', adminAuthUrl);
      
      const response = await fetch(adminAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({}) // Add empty body to ensure it's a POST request
      });

      console.log('Admin auth response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Admin auth error response:', errorText);
        throw new Error(`Failed to verify admin role: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Admin auth response:', responseData);

      // Store admin flag in localStorage
      localStorage.setItem('buti_admin', 'true');
      
      toast.success('התחברת בהצלחה כמנהל!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'שגיאה בהתחברות');
    } finally {
      setIsLoading(false);
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