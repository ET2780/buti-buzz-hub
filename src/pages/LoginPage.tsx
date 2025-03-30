
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isStaffLogin, setIsStaffLogin] = useState(false);

  const handleLoginWithGoogle = () => {
    // In a real app, this would authenticate with Google
    console.log('Logging in with Google');
    // Simulate successful login
    setTimeout(() => {
      // Store user is logged in state (in a real app, store token/session)
      localStorage.setItem('butiIsLoggedIn', 'true');
      localStorage.setItem('butiUser', JSON.stringify({
        name: 'אורח',
        avatar: '😎',
      }));
      
      // Show BUTI logo after login before navigating
      const loadingContainer = document.createElement('div');
      loadingContainer.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
      
      const logoElement = document.createElement('div');
      logoElement.className = 'animate-pulse';
      loadingContainer.appendChild(logoElement);
      
      document.body.appendChild(loadingContainer);

      setTimeout(() => {
        document.body.removeChild(loadingContainer);
        navigate('/buti');
      }, 1500);
      
      toast.success('התחברת בהצלחה');
    }, 1500);
  };

  const handleLoginWithEmail = (email: string) => {
    // Check if it's a staff login (in a real app, this would validate against a database)
    const isStaff = email.endsWith('@buti.cafe') || email === 'admin@buti.cafe';
    
    console.log('Logging in with email:', email);
    
    // For demo purposes, let's just auto-login after a delay
    // In a real app, the user would click the magic link in their email
    toast.success(`קישור קסם נשלח אל ${email}`, {
      description: "להדגמה זו בלבד, תתחבר/י אוטומטית תוך 3 שניות."
    });
    
    setTimeout(() => {
      // Store user is logged in state
      localStorage.setItem('butiIsLoggedIn', 'true');
      
      if (isStaff) {
        localStorage.setItem('butiUser', JSON.stringify({
          name: 'צוות BUTI',
          avatar: 'BUTI',
          isAdmin: true
        }));
        toast.success('התחברת כצוות BUTI');
      } else {
        localStorage.setItem('butiUser', JSON.stringify({
          name: email.split('@')[0],
          avatar: '😊',
        }));
      }
      
      // Show BUTI logo after login before navigating
      const loadingContainer = document.createElement('div');
      loadingContainer.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
      
      const logoElement = document.createElement('div');
      logoElement.className = 'animate-pulse';
      loadingContainer.appendChild(logoElement);
      
      document.body.appendChild(loadingContainer);

      setTimeout(() => {
        document.body.removeChild(loadingContainer);
        navigate('/buti');
      }, 1500);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-buti-light">
      <header className="p-6">
        <Logo size="medium" className="mx-auto mb-8" />
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm 
            onLoginWithGoogle={handleLoginWithGoogle}
            onLoginWithEmail={handleLoginWithEmail}
            isStaffLogin={isStaffLogin}
            onToggleStaffLogin={() => setIsStaffLogin(!isStaffLogin)}
          />
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} קפה BUTI • רחוב דיזנגוף, תל אביב
      </footer>
    </div>
  );
};

export default LoginPage;
