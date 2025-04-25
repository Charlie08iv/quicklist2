
import React, { createContext, useState, useContext, useCallback } from 'react';

// Define available languages and translations
const languages = {
  en: {
    lists: "Lists",
    recipes: "Recipes", 
    groups: "Groups",
    profile: "Profile",
    settings: "Settings",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    shopping_list: "Shopping List",
    today: "Today",
    searchRecipes: "Search recipes...",
    ingredients: "Ingredients",
    instructions: "Instructions",
    prepTime: "Prep Time",
    cookTime: "Cook Time",
    addToList: "Add to List",
    createGroup: "Create Group",
    joinGroup: "Join Group",
    members: "Members",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    login: "Login",
    signup: "Sign up",
    logout: "Log out",
    notifications: "Notifications",
    share: "Share",
    sharedWith: "Shared with",
    createRecipe: "Create Recipe",
    createList: "Create List",
    connectionIssue: "Unable to connect to the server",
    tryAgain: "Try Again",
    refresh: "Refresh",
    emptyList: "No items in this list yet",
    itemsCompleted: "items completed",
    No_shopping_lists: "No shopping lists",
    No_archived_lists: "No archived lists",
    disableNotifications: "Disable Notifications",
    enableNotifications: "Enable Notifications"
  },
  sv: {
    lists: "Listor",
    recipes: "Recept", 
    groups: "Grupper",
    profile: "Profil",
    settings: "Inställningar",
    breakfast: "Frukost",
    lunch: "Lunch",
    dinner: "Middag",
    shopping_list: "Inköpslista",
    today: "Idag",
    searchRecipes: "Sök recept...",
    ingredients: "Ingredienser",
    instructions: "Instruktioner",
    prepTime: "Förberedelsetid",
    cookTime: "Tillagningstid",
    addToList: "Lägg till i lista",
    createGroup: "Skapa grupp",
    joinGroup: "Gå med i grupp",
    members: "Medlemmar",
    lightMode: "Ljust läge",
    darkMode: "Mörkt läge",
    language: "Språk",
    login: "Logga in",
    signup: "Registrera dig",
    logout: "Logga ut",
    notifications: "Notiser",
    share: "Dela",
    sharedWith: "Delad med",
    createRecipe: "Skapa recept",
    createList: "Skapa lista",
    connectionIssue: "Kan inte ansluta till servern",
    tryAgain: "Försök igen",
    refresh: "Uppdatera",
    emptyList: "Denna lista har inga varor än",
    itemsCompleted: "varor klara",
    No_shopping_lists: "Inga inköpslistor",
    No_archived_lists: "Inga arkiverade listor",
    disableNotifications: "Inaktivera aviseringar",
    enableNotifications: "Aktivera aviseringar"
  }
};

export type LanguageCode = 'en' | 'sv';
type TranslationContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');
  
  const t = useCallback((key: string): string => {
    const translations = languages[language];
    return translations[key as keyof typeof translations] || key;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  return context;
};
