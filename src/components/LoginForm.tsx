
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createAdminUser } from '@/utils/authUtils';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const LoginForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
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
        // Admin login needs email and password
        if (!email.trim() || (!isResetPassword && !password.trim())) {
          toast.error('נא להזין אימייל וסיסמה למנהלים');
          setIsLoading(false);
          return;
        }

        if (isResetPassword) {
          // Logic for password reset
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin + '/reset-password',
            });
            
            if (error) throw error;
            
            toast.success('קישור לאיפוס סיסמה נשלח לאימייל שלך');
            
            // For demo purposes, also log in as admin
            setTimeout(() => {
              toast.info('למטרות הדגמה, התחברת כמנהל/ת');
              createAdminUser(name, randomAvatar, email);
              navigate('/buti');
            }, 2000);
          } catch (error: any) {
            console.error('Password reset error:', error);
            toast.error(error.message || 'שגיאה בשליחת קישור לאיפוס סיסמה');
            return;
          }
        } else {
          // Try to sign in with Supabase first
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (error) {
              // For demo purposes, fallback to mock login if using the demo credentials
              if (email === 'admin@buti.cafe' && password === 'admin123') {
                createAdminUser(name, randomAvatar, email);
                toast.success('התחברת כמנהל/ת (מצב הדגמה)');
                navigate('/buti');
                return;
              } else {
                throw error;
              }
            }
            
            if (data.user) {
              toast.success('התחברת בהצלחה');
              navigate('/buti');
            }
          } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.message || 'אימייל או סיסמה שגויים');
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Regular guest user
        localStorage.setItem('tempMockGuestName', name);
        localStorage.setItem('tempMockAvatar', randomAvatar);
        localStorage.setItem('tempMockIsStaff', 'false');
        
        // Dispatch a custom event to notify the auth context
        document.dispatchEvent(new Event('customStorageEvent'));
        
        toast.success('ברוך הבא!');
        navigate('/buti');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('שגיאה בהתחברות, אנא נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

        {isAdmin && (
          <>
            <div>
              <Input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-right"
              />
            </div>

            {!isResetPassword && (
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-right pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                    <Eye className="h-5 w-5 text-gray-400" />
                  }
                </button>
              </div>
            )}

            <div className="text-left">
              <button
                type="button"
                onClick={() => setIsResetPassword(!isResetPassword)}
                className="text-sm text-primary hover:underline"
              >
                {isResetPassword ? 'חזרה להתחברות' : 'שכחתי סיסמה'}
              </button>
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'מתחבר...' : isAdmin 
            ? (isResetPassword ? 'שליחת קישור לאיפוס סיסמה' : 'התחברות כמנהל/ת') 
            : 'כניסה לצ\'אט'}
        </Button>

        {isAdmin && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            * לצורך הדגמה: admin@buti.cafe / admin123
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
