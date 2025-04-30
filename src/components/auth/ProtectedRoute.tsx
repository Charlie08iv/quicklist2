
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, initialized } = useAuth();

  // Timeout handling for better UX
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    // If still loading after 3 seconds, show timeout message
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Early return if we have a user - no need to wait
  if (user) {
    return <>{children}</>;
  }

  // Show loading state only if we're still loading and haven't timed out
  if (isLoading && !showTimeout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show timeout message after 3 seconds of loading
  if (showTimeout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Authentication is taking longer than expected.</p>
          <p className="text-muted-foreground">You may need to <a href="/auth" className="text-primary underline">log in again</a>.</p>
        </div>
      </div>
    );
  }

  // If not logged in and not loading, redirect to auth
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
