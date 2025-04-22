import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  console.log("AdminLoginModal rendering, isOpen:", isOpen);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    console.log("AdminLoginModal mounted");
    return () => {
      console.log("AdminLoginModal unmounted");
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    console.log("Login form submitted");
    e.preventDefault();
    console.log("Starting admin login process...");
    setIsLoading(true);

    try {
      console.log("Calling admin auth function...");
      // Call the secure admin auth Edge Function
      const response = await fetch('https://bgrpkdtlnlxifdlqrcay.supabase.co/functions/v1/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors',
        credentials: 'omit'
      });

      console.log("Admin auth response status:", response.status);
      const data = await response.json();
      console.log("Admin auth response data:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      console.log("Admin auth successful, signing in user...");
      // If successful, sign in the user
      await signIn(email, password);
      
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
          <DialogTitle>התחברות מנהל</DialogTitle>
          <DialogDescription>
            הזן את פרטי ההתחברות שלך כמנהל
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">אימייל</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                console.log("Email changed:", e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="הזן אימייל"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                console.log("Password changed");
                setPassword(e.target.value);
              }}
              placeholder="הזן סיסמה"
              required
              dir="ltr"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              onClick={() => console.log("Login button clicked")}
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 