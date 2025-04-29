
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, verifyAuth } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isGuest: boolean;
  authError: Error | null;
  refreshSession: () => Promise<void>;
  authInitialized: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isGuest: false,
  authError: null,
  refreshSession: async () => {},
  authInitialized: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      console.log("Manually refreshing session");
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session refresh error:", error);
        setAuthError(error);
        toast.error("Failed to refresh authentication. Please try logging in again.");
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Update guest mode
      const path = window.location.pathname;
      const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
      setIsGuest(!data.session && isGuestAccessiblePath);
      
      console.log("Session refreshed:", data.session?.user?.id || 'No active session');
      
      if (data.session) {
        toast.success("Session refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setAuthError(error instanceof Error ? error : new Error('Unknown error refreshing session'));
      toast.error("Failed to refresh session");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    let mounted = true;
    console.log("Auth provider initializing");
    
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check guest mode after auth state changes
        const path = window.location.pathname;
        const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
        setIsGuest(!currentSession && isGuestAccessiblePath);
        
        // If we get a SIGNED_IN event but don't have a user profile yet, create one
        if (event === 'SIGNED_IN' && currentSession) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', currentSession.user.id)
              .maybeSingle();
              
            if (!data && !error) {
              // Profile doesn't exist, create it
              console.log('Creating profile for user:', currentSession.user.id);
              await supabase
                .from('profiles')
                .insert({ 
                  id: currentSession.user.id,
                  email: currentSession.user.email
                });
            }
          } catch (e) {
            console.error('Error checking/creating profile:', e);
          }
        }
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
          setAuthInitialized(true);
          return;
        }
        
        console.log("Auth session retrieved:", data.session?.user?.id || 'No session');
        
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          // Check initial guest mode
          const path = window.location.pathname;
          const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
          setIsGuest(!data.session && isGuestAccessiblePath);
        }
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
        setAuthError(error instanceof Error ? error : new Error('Unknown authentication error'));
      } finally {
        if (mounted) {
          console.log("Auth initialization completed");
          setIsLoading(false);
          setAuthInitialized(true);
        }
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
      mounted = false;
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
      refreshSession,
      authInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
