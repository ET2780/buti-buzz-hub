
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Function to check for demo login from localStorage
export const checkForDemoLogin = () => {
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
    
    return mockUser;
  }
  
  return null;
};

export const fetchUserProfile = async (userId: string) => {
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
    
    return {
      id: profileData.id,
      name: profileData.name,
      avatar: profileData.avatar,
      isAdmin: isUserAdmin
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const signInWithEmail = async () => {
  const email = prompt('Please enter your email') || '';
  
  const { error } = await supabase.auth.signInWithOtp({
    email
  });
  
  if (error) throw error;
  
  toast.success('Magic link sent! Check your email.');
};

export const signInWithGoogle = async () => {
  console.log("Attempting Google sign in");
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login?auth=success`
    }
  });
  
  if (error) throw error;
  console.log("Google auth initiated:", data);
};

export const signOutUser = async () => {
  // Clear any local storage items for demo login
  localStorage.removeItem('tempMockEmail');
  localStorage.removeItem('tempMockIsStaff');
  localStorage.removeItem('tempMockGuestName');
  localStorage.removeItem('tempMockAvatar');
  
  // If we have a real session, sign out from supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const updateUserProfile = async (
  session: Session | null, 
  user: User | null, 
  updates: Partial<User>
) => {
  // For demo users, just update the local state
  if (!session?.user && user?.id) {
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
};
