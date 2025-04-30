
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";

const AppLayout = () => {
  const { isLoggedIn, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // List of paths that can be accessed without authentication
  const publicPaths = ['/lists', '/recipes'];
  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));
  const showLoginButton = !isLoggedIn && !isLoading && isPublicPath;

  // Debug user state
  React.useEffect(() => {
    console.log("AppLayout - Auth state:", { isLoggedIn, isLoading, hasUser: !!user, path: location.pathname });
  }, [isLoggedIn, isLoading, user, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showLoginButton && (
        <div className="bg-primary/10 p-2 text-center">
          <span className="text-sm">You're in guest mode. </span>
          <Button 
            variant="link" 
            className="text-primary font-medium p-0 ml-1 h-auto"
            onClick={() => navigate('/auth')}
          >
            Log in for all features
          </Button>
        </div>
      )}
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20 animate-fade-in">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
