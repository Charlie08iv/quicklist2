
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export const AppLayout = () => {
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // List of paths that can be accessed without authentication
  const publicPaths = ['/lists', '/recipes'];
  const isPublicPath = publicPaths.includes(location.pathname);
  const showLoginButton = !session && isPublicPath;

  return (
    <div className="min-h-screen flex flex-col bg-background bg-gradient-to-b from-background to-gray-50/50 dark:from-background dark:to-gray-950/30">
      {showLoginButton && (
        <div className="bg-primary/10 p-2 text-center">
          <span className="text-sm">You're viewing in guest mode. </span>
          <Button 
            variant="link" 
            className="text-primary font-medium p-0 ml-1 h-auto"
            onClick={() => navigate('/auth')}
          >
            Log in for full features
          </Button>
        </div>
      )}
      <main className="flex-1 container max-w-5xl mx-auto p-4 pb-20 animate-fade-in">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
