
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types';
import { toast } from 'sonner';
import { 
  signInWithEmail, 
  signInWithGoogle, 
  signOutUser, 
  updateUserProfile,
  checkForDemoLogin,
  fetchUserProfile
} from '@/utils/authUtils';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext initialized");
    
    // Import auth initialization logic to avoid circular dependencies
    const { setupAuthListeners } = require('@/utils/authInitializer');
    
    return setupAuthListeners({
      setSession,
      setUser,
      setIsAdmin,
      setIsLoading,
      fetchUserProfile
    });
  }, []);

  const signIn = async () => {
    try {
      await signInWithEmail();
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google authentication failed');
      throw error;
    }
  };

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
      if (!session?.user && !user?.id) throw new Error('No user logged in');
      
      await updateUserProfile(session, user, updates);
      
      if (user) {
        setUser({ ...user, ...updates });
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const value = {
    session,
    user,
    isAdmin,
    isLoading,
    signIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
