
import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const EMOJIS = ['😊', '😎', '🤓', '🧠', '👾', '🤖', '👋', '🦄', '🌟', '🍕', '🍩', '☕', '🌈', '🚀'];

interface LoginFormProps {
  onLoginAsGuest: (name: string, avatar: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginAsGuest }) => {
  const [guestName, setGuestName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😊');
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = () => {
    if (!guestName.trim()) {
      return;
    }
    
    setIsLoading(true);
    onLoginAsGuest(guestName, selectedAvatar);
    
    // Reset loading state after a delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">התחברות לקפה BUTI</CardTitle>
        <CardDescription>
          הזן את שמך והצטרף לקהילה שלנו
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="הכנס/י את שמך"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="mb-3"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">בחר/י אווטר</label>
            <div className="grid grid-cols-7 gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center ${
                    selectedAvatar === emoji ? 'bg-primary text-white' : 'bg-secondary'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            className="w-full flex items-center gap-2 justify-center mt-4"
            onClick={handleGuestLogin}
            disabled={isLoading || !guestName.trim()}
          >
            <User size={16} />
            {isLoading ? "מתחבר..." : "התחבר/י"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground">
          בהמשך, את/ה מסכים/ה לתנאי השימוש ולמדיניות הפרטיות שלנו.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
