
import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, BookOpen, Users, UserCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export const BottomNavigation = () => {
  const { t } = useTranslation();

  const navItems = [
    {
      path: "/lists",
      label: t("lists"),
      icon: <Calendar className="h-5 w-5" />,
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-10">
      <div className="container max-w-5xl mx-auto">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`
              }
            >
              <div className="flex items-center justify-center p-1">
                {item.icon}
              </div>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
