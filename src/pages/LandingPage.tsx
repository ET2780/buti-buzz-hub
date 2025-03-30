
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import PerkCard from '@/components/PerkCard';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-buti-light">
      <header className="p-6 flex items-center">
        <Logo size="medium" />
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          ברוכים הבאים לקהילת BUTI ☕
        </h1>
        
        <p className="text-xl mb-8 text-muted-foreground">
          הצטרפו לצ'אט החי, הציעו שיר, וקבלו את מבצע היום של הקפה — ללא צורך באפליקציה.
        </p>
        
        <Button 
          onClick={() => navigate('/login')} 
          size="lg" 
          className="text-lg px-8 py-6 mb-12"
        >
          כניסה לצ'אט BUTI
        </Button>
        
        <div className="w-full max-w-sm mx-auto opacity-85">
          <PerkCard 
            title="הטבת היום" 
            description="קנו קפה אחד, קבלו עוגיה חינם! ☕🍪" 
          />
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} קפה BUTI • רחוב דיזנגוף, תל אביב
      </footer>
    </div>
  );
};

export default LandingPage;
