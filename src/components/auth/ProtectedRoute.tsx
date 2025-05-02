
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const location = useLocation();

  // Double-check session directly with Supabase for critical routes
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session verification error:", error);
          setHasValidSession(false);
        } else {
          setHasValidSession(!!data.session);
        }
      } catch (err) {
        console.error("Unexpected error during session verification:", err);
        setHasValidSession(false);
      } finally {
        setVerifyingSession(false);
      }
    };

    verifySession();
  }, [location.pathname]);

  if (isLoading || verifyingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Use both auth context and direct session check
  if (!isLoggedIn && !hasValidSession) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
