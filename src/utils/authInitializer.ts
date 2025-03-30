
import { supabase } from '@/integrations/supabase/client';
import { checkForDemoLogin } from './authUtils';

export const setupAuthListeners = ({
  setSession,
  setUser,
  setIsAdmin,
  setIsLoading,
  fetchUserProfile
}) => {
  console.log("Setting up auth listeners");
  
  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);
      setSession(newSession);
      
      if (newSession?.user) {
        try {
          const profile = await fetchUserProfile(newSession.user.id);
          setUser(profile);
          setIsAdmin(profile.isAdmin);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      } else {
        // Check for demo login if no supabase session
        const demoUser = checkForDemoLogin();
        if (demoUser) {
          setUser(demoUser);
          setIsAdmin(demoUser.isAdmin);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    }
  );

  // Check for existing session
  const initializeAuth = async () => {
    try {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
        return;
      }
      
      console.log("Initial session check:", initialSession?.user?.id || "No session");
      setSession(initialSession);

      if (initialSession?.user) {
        try {
          const profile = await fetchUserProfile(initialSession.user.id);
          setUser(profile);
          setIsAdmin(profile.isAdmin);
        } catch (error) {
          console.error("Error fetching initial user profile:", error);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        // Check for demo login if no supabase session
        const demoUser = checkForDemoLogin();
        if (demoUser) {
          setUser(demoUser);
          setIsAdmin(demoUser.isAdmin);
        }
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
    subscription.unsubscribe();
    window.removeEventListener('storage', handleStorageChange);
    document.removeEventListener('customStorageEvent', handleCustomStorageEvent);
  };
};
