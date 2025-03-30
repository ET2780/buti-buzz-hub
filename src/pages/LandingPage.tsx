
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
          Welcome to BUTI's Community Hub ☕
        </h1>
        
        <p className="text-xl mb-8 text-muted-foreground">
          Join the live chat, suggest a song, and grab today's café deal — no app needed.
        </p>
        
        <Button 
          onClick={() => navigate('/login')} 
          size="lg" 
          className="text-lg px-8 py-6 mb-12"
        >
          Enter BUTI Chat
        </Button>
        
        <div className="w-full max-w-sm mx-auto opacity-85">
          <PerkCard 
            title="Today's Perk" 
            description="Buy 1 coffee, get a cookie free! ☕🍪" 
          />
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BUTI Café • Dizengoff St, Tel Aviv
      </footer>
    </div>
  );
};

export default LandingPage;
