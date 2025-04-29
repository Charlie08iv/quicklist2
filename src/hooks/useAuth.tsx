
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isGuest: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isGuest: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  useEffect(() => {
    // Check if user is in guest mode
    const checkGuestMode = () => {
      const path = window.location.pathname;
      const isGuestAccessiblePath = ['/lists', '/recipes'].includes(path);
      setIsGuest(!session && isGuestAccessiblePath);
    };
    
    // Setup auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        checkGuestMode();
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
      checkGuestMode();
    });

    window.addEventListener('popstate', checkGuestMode);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', checkGuestMode);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoggedIn: !!user, 
      isLoading, 
      isGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
