
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserWithRole } from '@/types';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

  // Function to check for demo login from localStorage
  const checkDemoLogin = () => {
    console.log("Checking for demo login");
    const mockEmail = localStorage.getItem('tempMockEmail');
    const mockIsStaff = localStorage.getItem('tempMockIsStaff') === 'true';
    const mockGuestName = localStorage.getItem('tempMockGuestName');
    const mockAvatar = localStorage.getItem('tempMockAvatar');
    
    if (mockEmail) {
      console.log("Found demo login for:", mockEmail);
      const mockUser: User = {
        id: mockEmail,
        name: mockGuestName || (mockEmail.includes('guest') ? `אורח/ת ${Math.floor(Math.random() * 1000)}` : mockEmail.split('@')[0]),
        avatar: mockAvatar || '😊',
        isAdmin: mockIsStaff
      };
      
      setUser(mockUser);
      setIsAdmin(mockIsStaff);
      setIsLoading(false);
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    console.log("AuthContext initialized");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id);
        } else {
          // Check for demo login if no supabase session
          if (!checkDemoLogin()) {
            setUser(null);
            setIsAdmin(false);
          }
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      console.log("Initial session check:", initialSession?.user?.id || "No session");
      setSession(initialSession);

      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user.id);
      } else {
        // Check for demo login if no supabase session
        if (!checkDemoLogin()) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Add a listener for storage changes to handle cases where localStorage is updated
    const handleStorageChange = (event: StorageEvent) => {
      console.log("Storage event detected:", event.key);
      if (event.key === 'tempMockEmail') {
        console.log("Storage event detected for tempMockEmail with value:", event.newValue);
        checkDemoLogin();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Add direct event listener for localStorage updates in the same window
    document.addEventListener('customStorageEvent', () => {
      console.log("Custom storage event detected");
      checkDemoLogin();
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('customStorageEvent', () => {
        console.log("Custom storage event listener removed");
      });
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError && roleError.code !== 'PGRST116') throw roleError; // PGRST116 is "no rows returned"

      const isUserAdmin = roleData?.role === 'admin';
      
      setUser({
        id: profileData.id,
        name: profileData.name,
        avatar: profileData.avatar,
        isAdmin: isUserAdmin
      });
      
      setIsAdmin(isUserAdmin);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: prompt('Please enter your email') || '',
      });
      
      if (error) throw error;
      
      toast.success('Magic link sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Attempting Google sign in");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/buti`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google authentication failed');
    }
  };

  const signOut = async () => {
    try {
      // Clear any local storage items for demo login
      localStorage.removeItem('tempMockEmail');
      localStorage.removeItem('tempMockIsStaff');
      localStorage.removeItem('tempMockGuestName');
      
      // If we have a real session, sign out from supabase
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
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
      
      // For demo users, just update the local state
      if (!session?.user && user?.id) {
        setUser({ ...user, ...updates });
        toast.success('Profile updated successfully');
        return;
      }
      
      const userId = session?.user.id;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
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
    signInWithGoogle,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
