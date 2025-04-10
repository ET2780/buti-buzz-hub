import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface NetworkProtectedRouteProps {
  children: ReactNode;
}

const NetworkProtectedRoute = ({ children }: NetworkProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      const connectionData = localStorage.getItem('buti_network_connected');
      if (connectionData) {
        const { connected, timestamp } = JSON.parse(connectionData);
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        
        if (connected && (now - timestamp <= TWENTY_FOUR_HOURS)) {
          setIsConnected(true);
        } else {
          localStorage.removeItem('buti_network_connected');
        }
      }
      setIsLoading(false);
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
};

export default NetworkProtectedRoute; 