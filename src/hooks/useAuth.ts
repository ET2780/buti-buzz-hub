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
      // First check if there's a temporary user
      const tempUserId = localStorage.getItem('temp_user_id');
      if (tempUserId) {
        // Get the temporary user's profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', tempUserId)
          .single();

        if (profile && !error) {
          setUser({
            id: tempUserId,
            user_metadata: {
              isTemporary: true,
              isAdmin: false,
              name: profile.name,
              avatar: profile.avatar,
              tags: profile.tags,
              customStatus: profile.custom_status,
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
          } as ExtendedUser);
          setLoading(false);
          return;
        }
      }

      // Then check for admin status
      const isAdmin = localStorage.getItem('buti_admin') === 'true';
      if (isAdmin) {
        // Generate a UUID for admin user
        const adminId = crypto.randomUUID();
        
        // Create admin profile in the database
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: adminId,
            name: 'Buti Staff',
            avatar: '/buti-logo.png',
            tags: ['admin'],
            custom_status: 'צוות BUTI'
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
        }

        setUser({
          id: adminId,
          user_metadata: {
            isTemporary: false,
            isAdmin: true,
            name: 'Buti Staff',
            avatar: '/buti-logo.png',
            permissions: {
              canManagePerks: true,
              canManageSongs: true,
              canManagePinnedMessages: true,
              canManageUsers: true,
              canEditProfile: true,
              canWriteMessages: true,
              canSuggestSongs: true
            }
          }
        } as ExtendedUser);
        setLoading(false);
        return;
      }

      // Finally, check for regular auth session
      supabase.auth.getSession().then(({ data: { session } }) => {
        handleUser(session?.user || null);
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const generateAmusingName = () => {
    const prefixes = ['מצחיק', 'חמוד', 'מתוק', 'מקסים', 'נחמד', 'מצוין', 'מדהים', 'מעולה'];
    const suffixes = ['בננה', 'תפוח', 'גלידה', 'פופקורן', 'שוקולד', 'פיצה', 'המבורגר', 'ציפס'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${randomPrefix} ${randomSuffix}`;
  };

  const createTemporaryUser = async () => {
    try {
      // Generate a temporary user ID and amusing name
      const tempUserId = crypto.randomUUID();
      const amusingName = generateAmusingName();
      
      // Create a temporary user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: tempUserId,
          name: amusingName,
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
            name: amusingName,
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
          name: amusingName,
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
      console.error('Error creating temporary user:', error);
      // Even if there's an error, we'll create a temporary user in memory
      const tempUserId = crypto.randomUUID();
      const amusingName = generateAmusingName();
      const tempUser = {
        id: tempUserId,
        user_metadata: {
          isTemporary: true,
          isAdmin: false,
          name: amusingName,
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
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            name: profile.name,
            avatar: profile.avatar,
            tags: profile.tags,
            customStatus: profile.customStatus
          }
        });
        return;
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
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          name: profile.name,
          avatar: profile.avatar,
          tags: profile.tags,
          customStatus: profile.customStatus
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

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