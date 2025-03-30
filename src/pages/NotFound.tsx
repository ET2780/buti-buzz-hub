
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-buti-light p-6 text-center">
      <Logo size="large" className="mb-8" />
      
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8 text-muted-foreground">
        Oops! This page seems to have wandered off.
      </p>
      
      <Button 
        onClick={() => navigate('/')} 
        size="lg"
      >
        Back to BUTI Café
      </Button>
    </div>
  );
};

export default NotFound;
