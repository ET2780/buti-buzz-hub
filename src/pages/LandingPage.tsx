
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import PerkCard from '@/components/PerkCard';
import { useAuth } from '@/hooks/useAuth';
import { PerksService } from '@/services/PerksService';
import { Perk } from '@/types';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePerk, setActivePerk] = useState<Perk | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivePerks();
  }, []);

  const fetchActivePerks = async () => {
    try {
      setIsLoading(true);
      const perks = await PerksService.getActivePerks();
      setActivePerk(perks.length > 0 ? perks[0] : null);
    } catch (error) {
      console.error('Failed to fetch active perks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCTAClick = () => {
    if (user) {
      navigate('/buti');
    } else {
      navigate('/login');
    }
  };

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
          onClick={handleCTAClick} 
          size="lg" 
          className="text-lg px-8 py-6 mb-12"
        >
          {user ? 'חזרה לצ\'אט BUTI' : 'כניסה לצ\'אט BUTI'}
        </Button>
        
        <div className="w-full max-w-sm mx-auto opacity-85">
          {isLoading ? (
            <div className="p-4 border rounded-md text-center text-muted-foreground animate-pulse">
              טוען הטבות...
            </div>
          ) : activePerk ? (
            <PerkCard 
              title={activePerk.title} 
              description={activePerk.description} 
            />
          ) : (
            <PerkCard 
              title="הצטרפו עכשיו" 
              description="התחברו כדי לראות את ההטבות העדכניות ביותר שלנו!" 
            />
          )}
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} קפה BUTI • רחוב דיזנגוף, תל אביב
      </footer>
    </div>
  );
};

export default LandingPage;
