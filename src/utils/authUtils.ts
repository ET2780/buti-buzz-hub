
import { User } from '@/types';

// Function to check for demo login from localStorage
export const checkForDemoLogin = () => {
  console.log("Checking for demo login");
  const mockEmail = localStorage.getItem('tempMockEmail');
  const mockIsStaff = localStorage.getItem('tempMockIsStaff') === 'true';
  const mockGuestName = localStorage.getItem('tempMockGuestName');
  const mockAvatar = localStorage.getItem('tempMockAvatar');
  
  if (mockEmail || mockGuestName) {
    console.log("Found demo login for:", mockEmail || mockGuestName);
    const mockUser: User = {
      id: mockEmail || mockGuestName || `guest-${Date.now()}`,
      name: mockGuestName || (mockEmail ? (mockEmail.includes('guest') ? `אורח/ת ${Math.floor(Math.random() * 1000)}` : mockEmail.split('@')[0]) : 'Guest'),
      avatar: mockAvatar || '😊',
      isAdmin: mockIsStaff
    };
    
    return mockUser;
  }
  
  return null;
};

export const signOutUser = async () => {
  // Clear local storage items for demo login
  localStorage.removeItem('tempMockEmail');
  localStorage.removeItem('tempMockIsStaff');
  localStorage.removeItem('tempMockGuestName');
  localStorage.removeItem('tempMockAvatar');
};

// Function to create an admin user
export const createAdminUser = (name: string, avatar: string = '😎') => {
  localStorage.setItem('tempMockEmail', `admin-${Date.now()}@buti.com`);
  localStorage.setItem('tempMockIsStaff', 'true');
  localStorage.setItem('tempMockGuestName', name);
  localStorage.setItem('tempMockAvatar', avatar);
  
  // Dispatch a custom event to notify the auth context
  document.dispatchEvent(new Event('customStorageEvent'));
};
