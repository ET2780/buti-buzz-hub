
import React, { useState } from 'react';
import { Mail, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface LoginFormProps {
  onLoginWithGoogle: () => void;
  onLoginWithEmail: (email: string) => void;
  isStaffLogin?: boolean;
  onToggleStaffLogin?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginWithGoogle, 
  onLoginWithEmail, 
  isStaffLogin = false,
  onToggleStaffLogin
}) => {
  const [email, setEmail] = useState(isStaffLogin ? 'admin@buti.cafe' : '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailLogin = () => {
    if (!email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call for magic link
    setTimeout(() => {
      onLoginWithEmail(email);
      toast({
        title: "Magic link sent!",
        description: "Check your email for a login link",
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Sign in to BUTI Café</CardTitle>
        <CardDescription>
          Join the community. No account needed - just verify it's you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isStaffLogin && (
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 justify-center"
            onClick={onLoginWithGoogle}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </Button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {isStaffLogin ? 'Staff Login' : 'Or continue with email'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Input
            type="email"
            placeholder={isStaffLogin ? "staff@buti.cafe" : "name@example.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button 
            className="w-full flex items-center gap-2 justify-center"
            onClick={handleEmailLogin}
            disabled={isLoading}
          >
            {isStaffLogin ? <Coffee size={16} /> : <Mail size={16} />}
            {isLoading ? "Sending link..." : "Send magic link"}
          </Button>
        </div>

        {onToggleStaffLogin && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted-foreground">BUTI Staff Login</span>
            <Switch 
              checked={isStaffLogin}
              onCheckedChange={onToggleStaffLogin}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
