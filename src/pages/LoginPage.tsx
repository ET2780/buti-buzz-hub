
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

  const handleLoginWithEmail = (email: string) => {
    // Check if it's a staff login (for demo purposes)
    const isStaff = email.endsWith('@buti.cafe') || email === 'admin@buti.cafe';
    
    // For demo purposes only
    toast.success(`קישור קסם נשלח אל ${email}`, {
      description: "להדגמה זו בלבד, תתחבר/י אוטומטית תוך 3 שניות."
    });
    
    // Simulate login for demo
    setTimeout(() => {
      // In a real app, we'd validate the token from the magic link here
      localStorage.setItem('tempMockEmail', email);
      localStorage.setItem('tempMockIsStaff', isStaff ? 'true' : 'false');
      
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
            onLoginWithEmail={handleLoginWithEmail}
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
