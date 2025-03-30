
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createAdminUser } from '@/utils/authUtils';

const LoginForm = () => {
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('נא להזין שם');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Choose a random emoji for avatar
      const avatars = ['😊', '😎', '🙂', '😄', '👋', '👍', '👏', '🎉'];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      
      if (isAdmin) {
        // Create an admin user
        createAdminUser(name, randomAvatar);
        toast.success('התחברת כמנהל/ת');
      } else {
        // Regular guest user
        localStorage.setItem('tempMockGuestName', name);
        localStorage.setItem('tempMockAvatar', randomAvatar);
        localStorage.setItem('tempMockIsStaff', 'false');
        
        // Dispatch a custom event to notify the auth context
        document.dispatchEvent(new Event('customStorageEvent'));
        
        toast.success('ברוך הבא!');
      }
      
      navigate('/buti');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('שגיאה בהתחברות, אנא נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold">כניסה לBUTI</h2>
        <p className="text-muted-foreground mt-2">
          התחבר/י כדי להצטרף לצ'אט ולהתעדכן בהטבות
        </p>
      </div>

      <form onSubmit={handleGuestLogin} className="space-y-4">
        <div>
          <Input
            placeholder="השם שלך"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-right"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="adminCheck"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="adminCheck" className="text-sm text-muted-foreground">
            התחבר/י כמנהל/ת
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'מתחבר...' : 'כניסה לצ\'אט'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
