
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";

const AppLayout = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // List of paths that can be accessed without authentication
  const publicPaths = ['/lists', '/recipes'];
  const isPublicPath = publicPaths.includes(location.pathname);
  const showLoginButton = !isLoggedIn && !isLoading && isPublicPath;

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
      
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20 animate-fade-in text-foreground">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
