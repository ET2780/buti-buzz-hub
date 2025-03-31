
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Demo perks storage key
const DEMO_PERKS_STORAGE_KEY = 'buti_demo_perks';

// Function to check for demo login from localStorage
export const checkForDemoLogin = () => {
  console.log("Checking for demo login");
  const mockEmail = localStorage.getItem('tempMockEmail');
  const mockIsStaff = localStorage.getItem('tempMockIsStaff') === 'true';
  const mockGuestName = localStorage.getItem('tempMockGuestName');
  const mockAvatar = localStorage.getItem('tempMockAvatar');
  const mockUserId = localStorage.getItem('tempMockUserId');
  
  if (mockEmail || mockGuestName) {
    console.log("Found demo login for:", mockEmail || mockGuestName);
    const userId = mockUserId || uuidv4(); // Use stored ID or generate new valid UUID
    
    // Save the UUID to localStorage if it's a new one
    if (!mockUserId) {
      localStorage.setItem('tempMockUserId', userId);
    }
    
    const mockUser: User = {
      id: userId, // Always use a valid UUID
      name: mockGuestName || (mockEmail ? (mockEmail.includes('guest') ? `אורח/ת ${Math.floor(Math.random() * 1000)}` : mockEmail.split('@')[0]) : 'Guest'),
      avatar: mockAvatar || '😊',
      isAdmin: mockIsStaff,
      email: mockEmail || null
    };
    
    return mockUser;
  }
  
  return null;
};

export const signOutUser = async () => {
  // Try to sign out from Supabase first
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out from Supabase:', error);
  }
  
  // Always clear local storage items for demo login
  localStorage.removeItem('tempMockEmail');
  localStorage.removeItem('tempMockIsStaff');
  localStorage.removeItem('tempMockGuestName');
  localStorage.removeItem('tempMockAvatar');
  localStorage.removeItem('tempMockResetEmail');
  localStorage.removeItem('tempMockUserId'); // Also clear stored UUID
  
  // Clear demo perks when admin logs out
  localStorage.removeItem(DEMO_PERKS_STORAGE_KEY);
};

// Function to create an admin user
export const createAdminUser = async (name: string, avatar: string = '😎', email: string = '') => {
  // First try with Supabase if email is provided
  if (email && email !== 'admin@buti.cafe') { // Skip Supabase for demo email
    try {
      // This would typically involve signing up the user first
      // and then adding them to an admin role, but for demo
      // we'll just check if they exist already
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'demo123', // This is just for the demo, should be secure in real app
      });
      
      if (error) {
        // User doesn't exist, would create here
        console.log('User does not exist in Supabase, using demo mode');
      } else if (data.user) {
        console.log('User exists in Supabase:', data.user);
        // Would add admin role here
        return;
      }
    } catch (error) {
      console.error('Error checking/creating Supabase user:', error);
    }
  }
  
  // Generate a valid UUID for the demo user
  const userId = uuidv4();
  
  // Fallback to localStorage for demo purposes
  localStorage.setItem('tempMockEmail', email || `admin-${Date.now()}@buti.com`);
  localStorage.setItem('tempMockIsStaff', 'true');
  localStorage.setItem('tempMockGuestName', name);
  localStorage.setItem('tempMockAvatar', avatar);
  localStorage.setItem('tempMockUserId', userId);
  
  // Dispatch a custom event to notify the auth context
  document.dispatchEvent(new Event('customStorageEvent'));
};
