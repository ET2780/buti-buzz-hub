
import { User } from '@/types';

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

export const signOutUser = async () => {
  // Clear local storage items for demo login
  localStorage.removeItem('tempMockEmail');
  localStorage.removeItem('tempMockIsStaff');
  localStorage.removeItem('tempMockGuestName');
  localStorage.removeItem('tempMockAvatar');
};
