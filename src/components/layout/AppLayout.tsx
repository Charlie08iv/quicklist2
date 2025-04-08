
import React from "react";
import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background bg-gradient-to-b from-background to-gray-50/50 dark:from-background dark:to-gray-950/30">
      <main className="flex-1 container max-w-5xl mx-auto p-4 pb-20 animate-fade-in">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
