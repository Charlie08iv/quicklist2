
import { createContext, useContext, useEffect, useState } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type Theme = "dark" | "light";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({ 
  children,
  defaultTheme = "light"
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Also add a data attribute for more specific CSS targeting
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    
    // Apply any additional theme-specific customizations
    if (theme === "light") {
      // Ensure proper text contrast in light mode
      root.style.setProperty("--form-field-bg-color", "#f2fce2");
      root.style.setProperty("--form-field-border-color", "#d9ecc0");
      root.style.setProperty("--form-field-text-color", "#1a2e0d");
      // Ensure better text visibility in light mode
      document.body.classList.add('text-foreground');
    } else {
      root.style.setProperty("--form-field-bg-color", "hsl(145, 30%, 18%)");
      root.style.setProperty("--form-field-border-color", "hsl(145, 30%, 22%)");
      root.style.setProperty("--form-field-text-color", "hsl(150, 30%, 98%)");
      // Reset for dark mode
      document.body.classList.remove('text-foreground');
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
