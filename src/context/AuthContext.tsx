import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from 'sonner';
import { signOutUser, checkForDemoLogin } from '@/utils/authUtils';
import { setupAuthListeners } from '@/utils/authInitializer';
import { useNavigate } from 'react-router-dom';

// Function to generate UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  profile: {
    username: string;
    avatar_url?: string;
    [key: string]: any;
  } | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthState['profile']>) => Promise<void>;
  createTemporaryUser: () => Promise<void>;
  cleanupTemporaryUser: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    profile: null,
    isLoading: true,
  });

  // Cleanup temporary user data and messages
  const cleanupTemporaryUser = async (userId: string) => {
    try {
      // Delete user's messages
      await supabase
        .from('messages')
        .delete()
        .eq('user_id', userId)
        .eq('is_temporary', true);

      // Remove from localStorage
      localStorage.removeItem('buti_user');
      localStorage.removeItem('buti_network_connected');
      
      // Clear auth state
      setAuthState({
        user: null,
        isAdmin: false,
        profile: null,
        isLoading: false
      });

      toast.success('התנתקת מרשת BUTI');
    } catch (error) {
      console.error('Error cleaning up temporary user:', error);
    }
  };

  useEffect(() => {
    // Check for temporary user first
    const tempUserStr = localStorage.getItem('buti_user');
    if (tempUserStr) {
      try {
        const tempUser = JSON.parse(tempUserStr);
        
        // Check if still connected to BUTI network
        const isConnected = localStorage.getItem('buti_network_connected');
        if (!isConnected && tempUser.isTemporary) {
          // If not connected to BUTI network and is a temporary user, clean up
          cleanupTemporaryUser(tempUser.id);
          return;
        }

        setAuthState({
          user: {
            id: tempUser.id,
            email: null,
            phone: null,
            created_at: tempUser.createdAt,
            user_metadata: {
              isTemporary: true,
              username: tempUser.username
            }
          } as User,
          isAdmin: false,
          profile: {
            username: tempUser.username,
            isTemporary: true
          },
          isLoading: false
        });
      } catch (error) {
        console.error('Error parsing temporary user:', error);
      }
    }

    // Check Supabase auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          isLoading: false
        }));
        checkUserRole(session.user.id);
        loadUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState(prev => ({
          ...prev,
          user: session.user
        }));
        checkUserRole(session.user.id);
        loadUserProfile(session.user.id);
      } else {
        setAuthState({
          user: null,
          isAdmin: false,
          profile: null,
          isLoading: false
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setAuthState(prev => ({
        ...prev,
        isAdmin: data.role === 'admin'
      }));
    }
  };

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setAuthState(prev => ({
        ...prev,
        profile: data
      }));
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    // If temporary user, clean up their data
    if (authState.user?.user_metadata?.isTemporary) {
      await cleanupTemporaryUser(authState.user.id);
    } else {
      // Regular Supabase signout
      await supabase.auth.signOut();
    }
    
    localStorage.removeItem('buti_user');
    setAuthState({
      user: null,
      isAdmin: false,
      profile: null,
      isLoading: false
    });
  };

  const updateProfile = async (updates: Partial<AuthState['profile']>) => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    if (authState.user.user_metadata?.isTemporary) {
      // Update temporary user
      const tempUser = {
        id: authState.user.id,
        username: updates.username || authState.profile?.username,
        isTemporary: true,
        createdAt: authState.user.created_at
      };
      
      localStorage.setItem('buti_user', JSON.stringify(tempUser));
      
      setAuthState(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...updates,
          isTemporary: true
        }
      }));
      
      return;
    }

    // Update Supabase profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: authState.user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    setAuthState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates
      }
    }));
  };

  const createTemporaryUser = async () => {
    const tempId = uuidv4(); // Generate proper UUID
    const timestamp = Date.now();
    const tempUser = {
      id: tempId,
      username: `אורח_${timestamp}`,
      isTemporary: true,
      createdAt: new Date().toISOString(),
      lastActive: timestamp
    };

    localStorage.setItem('buti_user', JSON.stringify(tempUser));

    setAuthState({
      user: {
        id: tempId,
        email: null,
        phone: null,
        created_at: tempUser.createdAt,
        user_metadata: {
          isTemporary: true,
          username: tempUser.username,
          lastActive: timestamp
        }
      } as User,
      isAdmin: false,
      profile: {
        username: tempUser.username,
        isTemporary: true
      },
      isLoading: false
    });

    // Set up periodic activity update
    const updateActivity = () => {
      const currentUser = localStorage.getItem('buti_user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        userData.lastActive = Date.now();
        localStorage.setItem('buti_user', JSON.stringify(userData));
      }
    };

    // Update activity every minute
    const activityInterval = setInterval(updateActivity, 60000);
    return () => clearInterval(activityInterval);
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signIn,
      signOut,
      updateProfile,
      createTemporaryUser,
      cleanupTemporaryUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
