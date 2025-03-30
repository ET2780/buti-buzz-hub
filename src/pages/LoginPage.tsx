
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to Buti page if user is already logged in
    if (user && !isLoading) {
      navigate('/buti');
    }
  }, [user, isLoading, navigate]);

  const handleLoginWithGoogle = () => {
    signInWithGoogle();
  };

  const handleLoginAsGuest = (name: string, avatar: string) => {
    // Create a guest user
    const guestName = name.trim();
    
    toast.success(`ברוך הבא, ${guestName}!`, {
      description: "מתחבר/ת כאורח/ת..."
    });

    // Store guest info in localStorage for demo purposes
    localStorage.setItem('tempMockEmail', `guest_${Date.now()}@buti.cafe`);
    localStorage.setItem('tempMockIsStaff', 'false');
    localStorage.setItem('tempMockGuestName', guestName);
    localStorage.setItem('tempMockAvatar', avatar);
    
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
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-buti-light">
      <header className="p-6">
        <Logo size="medium" className="mx-auto mb-8" />
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm 
            onLoginWithGoogle={handleLoginWithGoogle}
            onLoginAsGuest={handleLoginAsGuest}
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
