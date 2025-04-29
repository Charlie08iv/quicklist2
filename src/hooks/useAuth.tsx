
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isGuest: boolean;
  authError: Error | null;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isGuest: false,
  authError: null,
  refreshSession: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      console.log("Manually refreshing session");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session refresh error:", error);
        setAuthError(error);
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Update guest mode
      const path = window.location.pathname;
      const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
      setIsGuest(!data.session && isGuestAccessiblePath);
      
      console.log("Session refreshed:", data.session?.user?.id || 'No active session');
    } catch (error) {
      console.error("Error refreshing session:", error);
      setAuthError(error instanceof Error ? error : new Error('Unknown error refreshing session'));
    }
  };
  
  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check guest mode after auth state changes
        const path = window.location.pathname;
        const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
        setIsGuest(!currentSession && isGuestAccessiblePath);
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Starting auth initialization");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth initialization error:", error);
          setAuthError(error);
          setIsLoading(false);
          setInitialized(true);
          return;
        }
        
        console.log("Auth session retrieved:", data.session?.user?.id || 'No session');
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Check initial guest mode
        const path = window.location.pathname;
        const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
        setIsGuest(!data.session && isGuestAccessiblePath);
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
        setAuthError(error instanceof Error ? error : new Error('Unknown authentication error'));
      } finally {
        console.log("Auth initialization completed");
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
    
    // Monitor URL changes for guest mode
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
      setIsGuest(!session && isGuestAccessiblePath);
    };
    
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoggedIn: !!user, 
      isLoading, 
      isGuest,
      authError,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
