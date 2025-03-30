
import { checkForDemoLogin } from './authUtils';

export const setupAuthListeners = ({
  setUser,
  setIsAdmin,
  setIsLoading
}) => {
  console.log("Setting up auth listeners");
  
  // Check for localStorage login
  const initializeAuth = () => {
    try {
      // Check for demo login
      const demoUser = checkForDemoLogin();
      if (demoUser) {
        setUser(demoUser);
        setIsAdmin(demoUser.isAdmin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error in initializeAuth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  initializeAuth();

  // Add a listener for storage changes to handle cases where localStorage is updated
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
    window.removeEventListener('storage', handleStorageChange);
    document.removeEventListener('customStorageEvent', handleCustomStorageEvent);
  };
};
