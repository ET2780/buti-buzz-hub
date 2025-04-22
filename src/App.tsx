import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NetworkCheck } from '@/components/NetworkCheck';
import WelcomePage from '@/pages/WelcomePage';
import { ChatPage } from '@/pages/ChatPage';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';

console.log("Creating QueryClient...");
const queryClient = new QueryClient();

function NetworkProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("NetworkProtectedRoute: Checking connection...");
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
    return <div>Loading...</div>;
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  console.log("App component rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster position="top-center" />
          <NetworkCheck />
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route
              path="/chat"
              element={
                <NetworkProtectedRoute>
                  <ChatPage />
                </NetworkProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
