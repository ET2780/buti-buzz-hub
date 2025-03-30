
import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';
import { 
  signOutUser,
  checkForDemoLogin
} from '@/utils/authUtils';
import { setupAuthListeners } from '@/utils/authInitializer';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext initialized");
    
    return setupAuthListeners({
      setUser,
      setIsAdmin,
      setIsLoading
    });
  }, []);

  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setIsAdmin(false);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      // For simple name-only login, just update the local state
      setUser({ ...user, ...updates });
      
      // Update localStorage if needed
      if (updates.name) {
        localStorage.setItem('tempMockGuestName', updates.name);
      }
      if (updates.avatar) {
        localStorage.setItem('tempMockAvatar', updates.avatar);
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const value = {
    user,
    isAdmin,
    isLoading,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
