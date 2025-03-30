
import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';
import { signOutUser, checkForDemoLogin } from '@/utils/authUtils';
import { setupAuthListeners } from '@/utils/authInitializer';
import { supabase } from '@/integrations/supabase/client';

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

  // Setup Supabase auth listener
  useEffect(() => {
    // Set up Supabase auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth event:', event, session);
        
        if (session) {
          try {
            // Check if user has admin role in Supabase
            const { data: roles, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
              
            if (error) {
              console.error('Error fetching user roles:', error);
            }
            
            const isUserAdmin = roles?.some(r => r.role === 'admin') || false;
            
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
              avatar: session.user.user_metadata.avatar || '😊',
              isAdmin: isUserAdmin,
              email: session.user.email
            };
            
            setUser(userData);
            setIsAdmin(isUserAdmin);
            console.log('Set authenticated user:', userData);
          } catch (error) {
            console.error('Error setting authenticated user:', error);
          }
        }
      }
    );

    // Check for initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is logged in with Supabase
          const { data: roles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);
            
          if (error) {
            console.error('Error fetching user roles:', error);
          }
          
          const isUserAdmin = roles?.some(r => r.role === 'admin') || false;
          
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata.avatar || '😊',
            isAdmin: isUserAdmin,
            email: session.user.email
          };
          
          setUser(userData);
          setIsAdmin(isUserAdmin);
          console.log('Initial auth: Supabase user found', userData);
        } else {
          // Fallback to demo login
          console.log('No Supabase session, checking for demo login');
          const demoUser = checkForDemoLogin();
          if (demoUser) {
            setUser(demoUser);
            setIsAdmin(demoUser.isAdmin);
            console.log('Demo user found:', demoUser);
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        // Fallback to demo login on error
        const demoUser = checkForDemoLogin();
        if (demoUser) {
          setUser(demoUser);
          setIsAdmin(demoUser.isAdmin);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Add the localStorage event listener for demo login
    const handleStorageChange = (event: StorageEvent) => {
      console.log("Storage event detected:", event.key);
      if (event.key === 'tempMockEmail') {
        console.log("Storage event detected for tempMockEmail with value:", event.newValue);
        const demoUser = checkForDemoLogin();
        if (demoUser) {
          setUser(demoUser);
          setIsAdmin(demoUser.isAdmin);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Add direct event listener for localStorage updates in the same window
    const handleCustomStorageEvent = () => {
      console.log("Custom storage event detected");
      const demoUser = checkForDemoLogin();
      if (demoUser) {
        setUser(demoUser);
        setIsAdmin(demoUser.isAdmin);
      }
    };
    
    document.addEventListener('customStorageEvent', handleCustomStorageEvent);

    // Return cleanup function
    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('customStorageEvent', handleCustomStorageEvent);
    };
  }, []);

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Also clean up local storage for demo login
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
      
      // For Supabase users, update metadata
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        // Update user metadata in Supabase
        const { error } = await supabase.auth.updateUser({
          data: {
            name: updates.name || user.name,
            avatar: updates.avatar || user.avatar
          }
        });
        
        if (error) throw error;
      } else {
        // For simple name-only login, just update the local state
        if (updates.name) {
          localStorage.setItem('tempMockGuestName', updates.name);
        }
        if (updates.avatar) {
          localStorage.setItem('tempMockAvatar', updates.avatar);
        }
      }
      
      // Update local state
      setUser({ ...user, ...updates });
      
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
