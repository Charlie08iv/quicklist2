
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isGuest: boolean;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isGuest: false,
  initialized: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    console.log("Auth provider initializing...");
    
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        // Update state with the new session information
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setInitialized(true);
        setIsLoading(false);
        
        // Check guest mode after auth state changes
        const path = window.location.pathname;
        const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
        setIsGuest(!currentSession && isGuestAccessiblePath);
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data } = await supabase.auth.getSession();
        
        // Important: set the user state right away based on what we found
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        console.log("Session check result:", data.session ? "Session found" : "No session");
        
        // Check initial guest mode
        const path = window.location.pathname;
        const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
        setIsGuest(!data.session && isGuestAccessiblePath);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        // Mark as initialized and not loading whether we got a session or not
        setInitialized(true);
        setIsLoading(false);
        console.log("Auth initialization complete");
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
      initialized
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
