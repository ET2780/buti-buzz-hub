import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithGoogle, isLoading } = useAuth();

  useEffect(() => {
    // Check for authentication success from URL parameters (after OAuth redirect)
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'success') {
      toast.success("התחברת בהצלחה!", {
        description: "מועבר/ת לדף הצ'אט..."
      });
    }
    
    // Redirect to Buti page if user is already logged in
    if (user && !isLoading) {
      console.log("User detected, navigating to /buti");
      navigate('/buti');
    }
  }, [user, isLoading, navigate, location]);

  const handleLoginWithGoogle = async () => {
    console.log("Starting Google login flow");
    try {
      await signInWithGoogle();
      // Don't navigate here - we'll let the auth state change or redirect handle navigation
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("שגיאה בהתחברות עם גוגל", {
        description: "נסה/י שוב מאוחר יותר"
      });
    }
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
    
    console.log("Guest login data stored in localStorage");
    
    // Trigger a storage event for the AuthContext to pick up
    try {
      const storageEvent = new StorageEvent('storage', {
        key: 'tempMockEmail',
        newValue: localStorage.getItem('tempMockEmail')
      });
      window.dispatchEvent(storageEvent);
      console.log("Dispatched storage event");
      
      // Also dispatch a custom event to ensure it's caught in the same window
      document.dispatchEvent(new CustomEvent('customStorageEvent'));
      console.log("Dispatched custom storage event");
    } catch (e) {
      console.error("Could not dispatch storage event:", e);
    }
    
    // Show BUTI logo after login before navigating
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
    
    const logoElement = document.createElement('div');
    logoElement.className = 'animate-pulse';
    loadingContainer.appendChild(logoElement);
    
    document.body.appendChild(loadingContainer);

    // Force an immediate navigation to chat page
    console.log("Navigating to /buti after guest login");
    navigate('/buti');
    
    // Remove loading overlay after a short delay
    setTimeout(() => {
      if (document.body.contains(loadingContainer)) {
        document.body.removeChild(loadingContainer);
      }
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
