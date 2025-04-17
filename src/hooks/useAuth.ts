import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

// Create a service role client for admin operations
const serviceRoleClient = supabase;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for admin status in localStorage
    const isAdmin = localStorage.getItem('buti_admin') === 'true';
    
    const initializeAdmin = async () => {
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
              canEditProfile: true,
              canWriteMessages: true,
              canSuggestSongs: true
            }
          }
        });
        setLoading(false);
        return;
      }

      // Get initial session
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

    initializeAdmin();
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
        };

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
      };

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
      };

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

        // Update local user state with complete metadata
        const updatedUser = {
          ...user,
          username: profile.name,
          avatar: profile.avatar,
          tags: profile.tags,
          customStatus: profile.customStatus,
          user_metadata: {
            ...user.user_metadata,
            name: profile.name,
            avatar: profile.avatar,
            tags: profile.tags,
            customStatus: profile.customStatus,
            permissions: user.user_metadata?.permissions || {}
          }
        };

        setUser(updatedUser);

        // Dispatch a custom event with the updated user data
        const event = new CustomEvent('profile-updated', {
          detail: { user: updatedUser }
        });
        window.dispatchEvent(event);

        return updatedUser;
      }

      // For regular users, update both auth metadata and profiles table
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          avatar: profile.avatar,
          tags: profile.tags,
          customStatus: profile.customStatus,
          permissions: user.user_metadata?.permissions || {}
        }
      });

      if (metadataError) throw metadataError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updatedUserData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refresh the user to get updated metadata
      const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      
      if (refreshedUser) {
        // Create a complete user object with all necessary data
        const updatedUser = {
          ...refreshedUser,
          username: profile.name,
          avatar: profile.avatar,
          tags: profile.tags,
          customStatus: profile.customStatus,
          user_metadata: {
            ...refreshedUser.user_metadata,
            name: profile.name,
            avatar: profile.avatar,
            tags: profile.tags,
            customStatus: profile.customStatus
          }
        };

        setUser(updatedUser);
        
        // Dispatch a custom event with the complete updated user data
        const event = new CustomEvent('profile-updated', {
          detail: { user: updatedUser }
        });
        window.dispatchEvent(event);
        
        return updatedUser;
      }

      return null;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleUser = async (authUser: any) => {
    if (!authUser) {
      // Check for temporary user
      const tempUserId = localStorage.getItem('temp_user_id');
      if (tempUserId) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', tempUserId)
            .single();

          if (profileError) {
            console.error('Error fetching temporary profile:', profileError);
            localStorage.removeItem('temp_user_id');
            setUser(null);
            return;
          }

          if (profile) {
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
            });
            return;
          }
        } catch (error) {
          console.error('Error handling temporary user:', error);
          localStorage.removeItem('temp_user_id');
        }
      }
      setUser(null);
      return;
    }

    try {
      // Get or create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        // Create profile for new user
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            name: authUser.user_metadata?.name || 'New User',
            avatar: authUser.user_metadata?.avatar || '😊',
            tags: ['user'],
            custom_status: ''
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        }
      }

      // Set user with combined data
      const userData = {
        ...authUser,
        isAdmin: false,
        user_metadata: {
          ...authUser.user_metadata,
          isAdmin: false,
          isTemporary: false,
          name: authUser.user_metadata?.name || profile?.name || 'New User',
          avatar: authUser.user_metadata?.avatar || profile?.avatar || '😊',
          tags: profile?.tags || [],
          customStatus: profile?.custom_status || '',
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
      };

      console.log('Setting user data:', userData);
      setUser(userData);

      // Dispatch profile-updated event
      const event = new CustomEvent('profile-updated', {
        detail: { user: userData }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error handling user:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    if (!user) return;

    try {
      // If temporary user, clean up their data
      if (user.user_metadata?.isTemporary) {
        // Delete user profile
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        // Delete user role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        // Delete any messages from this user
        await supabase
          .from('messages')
          .delete()
          .eq('sender_id', user.id);

        // Clear temporary user data from localStorage
        localStorage.removeItem('temp_user_id');
        localStorage.removeItem('temp_user_name');
        localStorage.removeItem('temp_user_avatar');
      }

      // Regular Supabase signout
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  const resetAdminCredentials = async () => {
    try {
      // Sign in with service role to reset admin credentials
      const { error: signInError } = await serviceRoleClient.auth.signInWithPassword({
        email: 'admin@buti.com',
        password: 'admin09*&'
      });

      if (signInError) {
        // If sign in fails, try to sign up
        const { error: signUpError } = await serviceRoleClient.auth.signUp({
          email: 'admin@buti.com',
          password: 'admin09*&',
          options: {
            data: {
              name: 'Buti Staff',
              avatar: '👨‍💼',
              isAdmin: true,
              permissions: {
                canManagePerks: true,
                canManageSongs: true,
                canManagePinnedMessages: true,
                canEditProfile: true,
                canWriteMessages: true,
                canSuggestSongs: true
              }
            }
          }
        });

        if (signUpError) throw signUpError;
      }

      // Set admin flag in localStorage
      localStorage.setItem('buti_admin', 'true');
      
      toast.success('Admin credentials reset successfully');
      console.log('Admin credentials reset to:');
      console.log('Email: admin@buti.com');
      console.log('Password: admin09*&');
    } catch (error) {
      console.error('Error resetting admin credentials:', error);
      toast.error('Failed to reset admin credentials');
    }
  };

  return {
    user,
    loading,
    signOut,
    createTemporaryUser,
    updateProfile,
    resetAdminCredentials
  };
} 