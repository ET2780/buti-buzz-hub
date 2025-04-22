import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserMetadata {
  isTemporary?: boolean;
  isAdmin?: boolean;
  name?: string;
  avatar?: string;
  tags?: string[];
  customStatus?: string;
  permissions?: {
    canManagePerks: boolean;
    canManageSongs: boolean;
    canManagePinnedMessages: boolean;
    canManageUsers: boolean;
    canEditProfile: boolean;
    canWriteMessages: boolean;
    canSuggestSongs: boolean;
  };
}

interface ExtendedUser extends User {
  user_metadata: UserMetadata;
}

// Create a service role client for admin operations
const serviceRoleClient = supabase;

export function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing auth in useAuth hook...");
      // First check if there's a temporary user
      const tempUserId = localStorage.getItem('temp_user_id');
      if (tempUserId) {
        console.log("Found temporary user ID:", tempUserId);
        // Get the temporary user's profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', tempUserId)
          .single();

        if (profile && !error) {
          console.log("Found temporary user profile:", profile);
          setUser({
            id: tempUserId,
            user_metadata: {
              isTemporary: true,
              name: profile.name,
              avatar: profile.avatar,
              tags: profile.tags || [],
              customStatus: profile.custom_status,
              permissions: {
                canManagePerks: false,
                canManageSongs: false,
                canManagePinnedMessages: false,
                canManageUsers: false,
                canEditProfile: true,
                canWriteMessages: true,
                canSuggestSongs: true,
              },
            },
          } as ExtendedUser);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Signing in user with email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      console.log("Sign in successful, user data:", data);
      setUser(data.user as ExtendedUser);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const generateAmusingName = () => {
    const prefixes = ['מצחיק', 'חמוד', 'מתוק', 'מקסים', 'נחמד', 'מצוין', 'מדהים', 'מעולה'];
    const suffixes = ['בננה', 'תפוח', 'גלידה', 'פופקורן', 'שוקולד', 'פיצה', 'המבורגר', 'ציפס'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${randomPrefix} ${randomSuffix}`;
  };

  const getNextGuestNumber = async (): Promise<number> => {
    try {
      // Get all profiles with names starting with 'אורח'
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('name')
        .ilike('name', 'אורח%');

      if (error) {
        console.error('Error fetching guest profiles:', error);
        return 1; // Fallback to 1 if there's an error
      }

      // Extract numbers from guest names
      const numbers = profiles
        ?.map(profile => {
          const match = profile.name.match(/אורח(\d+)/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num)) || [];

      // Find the next available number
      const maxNumber = Math.max(0, ...numbers);
      return maxNumber + 1;
    } catch (error) {
      console.error('Error in getNextGuestNumber:', error);
      return 1; // Fallback to 1 if there's an error
    }
  };

  const createTemporaryUser = async () => {
    try {
      // Generate a temporary user ID and get the next guest number
      const tempUserId = crypto.randomUUID();
      const guestNumber = await getNextGuestNumber();
      const guestName = `אורח${guestNumber}`;
      
      // Create a temporary user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: tempUserId,
          name: guestName,
          avatar: '😊',
          tags: ['guest'],
          custom_status: 'אורח'
        });

      if (profileError) {
        console.error('Error creating temporary profile:', profileError);
        // If profile creation fails, we'll still create a temporary user in memory
        const tempUser = {
          id: tempUserId,
          user_metadata: {
            isTemporary: true,
            isAdmin: false,
            name: guestName,
            avatar: '😊',
            tags: ['guest'],
            customStatus: 'אורח',
            permissions: {
              canManagePerks: false,
              canManageSongs: false,
              canManagePinnedMessages: false,
              canManageUsers: false,
              canEditProfile: true,
              canWriteMessages: true,
              canSuggestSongs: true
            }
          }
        } as ExtendedUser;

        setUser(tempUser);
        localStorage.setItem('temp_user_id', tempUserId);
        return tempUserId;
      }

      // Set the user in state
      const tempUser = {
        id: tempUserId,
        user_metadata: {
          isTemporary: true,
          isAdmin: false,
          name: guestName,
          avatar: '😊',
          tags: ['guest'],
          customStatus: 'אורח',
          permissions: {
            canManagePerks: false,
            canManageSongs: false,
            canManagePinnedMessages: false,
            canManageUsers: false,
            canEditProfile: true,
            canWriteMessages: true,
            canSuggestSongs: true
          }
        }
      } as ExtendedUser;

      setUser(tempUser);
      localStorage.setItem('temp_user_id', tempUserId);
      return tempUserId;
    } catch (error) {
      console.error('Error in createTemporaryUser:', error);
      throw error;
    }
  };

  const updateProfile = async (profile: {
    name: string;
    avatar: string;
    tags: string[];
    customStatus?: string;
  }) => {
    if (!user) throw new Error('No user logged in');

    try {
      // Prepare the updated user data
      const updatedUserData = {
        name: profile.name,
        avatar: profile.avatar,
        tags: profile.tags,
        custom_status: profile.customStatus,
        updated_at: new Date().toISOString()
      };

      // For temporary users, only update the profiles table
      if (user.user_metadata?.isTemporary) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updatedUserData)
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Update the user state
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            name: profile.name,
            avatar: profile.avatar,
            tags: profile.tags,
            customStatus: profile.customStatus
          }
        } as ExtendedUser;

        setUser(updatedUser);
        return updatedUser;
      }

      // For regular users, update both auth and profiles
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          avatar: profile.avatar,
          tags: profile.tags,
          customStatus: profile.customStatus
        }
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updatedUserData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update the user state
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          name: profile.name,
          avatar: profile.avatar,
          tags: profile.tags,
          customStatus: profile.customStatus
        }
      } as ExtendedUser;

      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Add real-time subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    interface ProfileUpdatePayload {
      new: {
        id: string;
        name: string;
        avatar: string;
        tags: string[];
        custom_status: string;
      };
    }

    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload: ProfileUpdatePayload) => {
          console.log('Profile update received:', payload);
          const newData = payload.new;
          
          // Only update the user state if the updated profile belongs to the current user
          if (newData.id === user.id) {
            setUser(prev => {
              if (!prev) return null;
              return {
                ...prev,
                user_metadata: {
                  ...prev.user_metadata,
                  name: newData.name,
                  avatar: newData.avatar,
                  tags: newData.tags,
                  customStatus: newData.custom_status
                }
              } as ExtendedUser;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleUser = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      // Get the user's profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Create the extended user object
      const extendedUser = {
        ...authUser,
        user_metadata: {
          ...authUser.user_metadata,
          name: profile?.name || authUser.user_metadata?.name,
          avatar: profile?.avatar || authUser.user_metadata?.avatar,
          tags: profile?.tags || authUser.user_metadata?.tags,
          customStatus: profile?.custom_status || authUser.user_metadata?.customStatus,
          permissions: {
            canManagePerks: profile?.tags?.includes('admin') || false,
            canManageSongs: profile?.tags?.includes('admin') || false,
            canManagePinnedMessages: profile?.tags?.includes('admin') || false,
            canManageUsers: profile?.tags?.includes('admin') || false,
            canEditProfile: true,
            canWriteMessages: true,
            canSuggestSongs: true
          }
        }
      } as ExtendedUser;

      setUser(extendedUser);
    } catch (error) {
      console.error('Error handling user:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('temp_user_id');
      localStorage.removeItem('buti_admin');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetAdminCredentials = async () => {
    try {
      localStorage.removeItem('buti_admin');
      await signOut();
    } catch (error) {
      console.error('Error resetting admin credentials:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    createTemporaryUser,
    updateProfile,
    signOut,
    resetAdminCredentials
  };
} 