
import React from "react";
import { NavLink } from "react-router-dom";
import { List, BookOpen, Users, UserCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const { t } = useTranslation();

  const navItems = [
    {
      path: "/lists",
      label: t("lists"),
      icon: <List className="h-5 w-5" />,
    },
    {
      path: "/recipes",
      label: t("recipes"),
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      path: "/groups",
      label: t("groups"),
      icon: <Users className="h-5 w-5" />,
    },
    {
      path: "/profile",
      label: t("profile"),
      icon: <UserCircle className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border shadow-lg z-50">
      <div className="container max-w-md mx-auto">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-3 transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <div className="flex items-center justify-center p-1">
                {item.icon}
              </div>
              <span className="text-xs mt-0.5 font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
