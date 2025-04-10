import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FiWifi } from "react-icons/fi";

export function NetworkCheck() {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if connection has expired (24 hours)
    const checkConnectionExpiry = () => {
      const connectionData = localStorage.getItem('buti_network_connected');
      if (connectionData) {
        const { timestamp } = JSON.parse(connectionData);
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        
        if (now - timestamp > TWENTY_FOUR_HOURS) {
          localStorage.removeItem('buti_network_connected');
          navigate('/connect');
        }
      }
    };

    checkConnectionExpiry();
  }, [navigate]);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate checking WiFi connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set network connection status with timestamp
      const connectionData = {
        connected: true,
        timestamp: Date.now()
      };
      localStorage.setItem('buti_network_connected', JSON.stringify(connectionData));
      
      // Show success message
      toast.success('התחברת בהצלחה לרשת BUTI');
      
      // Navigate to welcome page immediately
      navigate('/');
    } catch (error) {
      console.error('Error connecting to network:', error);
      toast.error('התחברות נכשלה. נסו שוב.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate disconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove network connection status
      localStorage.removeItem('buti_network_connected');
      
      // Navigate to connect page
      navigate('/connect', { replace: true });
    } catch (error) {
      console.error('Error disconnecting from network:', error);
      toast.error('ניתוק נכשל. נסו שוב.');
    } finally {
      setIsConnecting(false);
    }
  };

  const isConnected = () => {
    const connectionData = localStorage.getItem('buti_network_connected');
    if (!connectionData) return false;
    
    const { connected, timestamp } = JSON.parse(connectionData);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    return connected && (now - timestamp <= TWENTY_FOUR_HOURS);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/buti-cafe-wall.jpg")',
          transform: 'scale(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Content Card */}
      <div className="relative w-full max-w-md bg-white/95 p-8 shadow-2xl backdrop-blur-sm border-0 animate-fadeIn">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white/80 blur-xl rounded-full transform scale-150" />
            <img 
              src="/buti-logo.png" 
              alt="BUTI Logo" 
              className="h-20 relative object-contain drop-shadow-md"
            />
          </div>
        </div>

        <div className="space-y-6 text-right" dir="rtl">
          <h2 className="text-xl font-semibold text-gray-900">
            ברוכים הבאים ל-BUTI
          </h2>
          
          {isConnected() ? (
            <>
              <p className="text-green-500 font-medium">מחובר לרשת BUTI</p>
              <Button
                onClick={handleDisconnect}
                disabled={isConnecting}
                variant="destructive"
                className="w-full"
              >
                {isConnecting ? 'מתנתק...' : 'התנתק מהרשת'}
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                יש להתחבר לרשת BUTI כדי להשתמש באפליקציה
              </p>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? 'מתחבר...' : 'התחבר לרשת'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 