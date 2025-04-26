
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
    enableNotifications: "Enable Notifications",
    shareList: "Share list",
    sortBy: "Sort by",
    categories: "Categories",
    alphabetically: "Alphabetically",
    custom: "Custom",
    showPrices: "Show prices",
    uncheckAllItems: "Uncheck all items",
    manageList: "Manage List",
    itemsUnchecked: "All items have been unchecked",
    itemsSorted: "Items have been sorted",
    priceDisplay: "Price display has been toggled",
    listSorted: "List sorted",
    pricesToggled: "Prices toggled",
    feedback: "Feedback",
    sendFeedback: "Send Feedback",
    general: "General",
    rateTheApp: "Rate the app!",
    reportProblem: "Report a problem/feedback",
    openLastUsed: "Open last used list",
    keepScreenOn: "Keep the screen on",
    switchTo: "Switch to",
    mode: "mode",
    myLists: "My Lists",
    archived: "Archived",
    error: "Error",
    listNotFound: "List not found",
    listDoesNotExist: "The list you're looking for doesn't exist or has been deleted",
    failedToLoadList: "Failed to load list details",
    itemAdded: "Item added",
    newItemAdded: "New item has been added to your list",
    itemRemoved: "Item removed",
    itemHasBeenRemoved: "Item has been removed from your list",
    failedToAddItem: "Failed to add item",
    failedToRemoveItem: "Failed to remove item",
    failedToUpdateItem: "Failed to update item",
    itemUpdated: "Item updated",
    itemHasBeenUpdated: "Item has been updated",
    itemsAlphabetically: "Items have been sorted alphabetically",
    itemsByCategory: "Items have been sorted by category",
    customSorting: "Switched to custom sorting mode",
    profilePictureUpdated: "Profile picture updated",
    profilePictureSuccess: "Your profile picture has been successfully updated.",
    shareApp: "Share app",
    supportAndFeedback: "Support and feedback",
    privacyPolicy: "Privacy Policy",
    thankYou: "Thank you!",
    ratingSoon: "Rating functionality will be implemented soon.",
    success: "Success",
    thanksForSharing: "Thanks for sharing!",
    linkCopied: "Link copied!",
    appLinkCopied: "The app link has been copied to your clipboard",
    couldntShare: "Couldn't share",
    tryToCopy: "Please try copying the link instead",
    account: "Account"
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
    enableNotifications: "Aktivera aviseringar",
    shareList: "Dela lista",
    sortBy: "Sortera efter",
    categories: "Kategorier",
    alphabetically: "Alfabetiskt",
    custom: "Anpassad",
    showPrices: "Visa priser",
    uncheckAllItems: "Avmarkera alla varor",
    manageList: "Hantera lista",
    itemsUnchecked: "Alla varor har avmarkerats",
    itemsSorted: "Varorna har sorterats",
    priceDisplay: "Prisvisning har växlats",
    listSorted: "Lista sorterad",
    pricesToggled: "Priser växlade",
    feedback: "Feedback",
    sendFeedback: "Skicka feedback",
    general: "Allmänt",
    rateTheApp: "Betygsätt appen!",
    reportProblem: "Rapportera ett problem/feedback",
    openLastUsed: "Öppna senast använda listan",
    keepScreenOn: "Håll skärmen på",
    switchTo: "Byt till",
    mode: "läge",
    myLists: "Mina listor",
    archived: "Arkiverade",
    error: "Fel",
    listNotFound: "Lista hittades inte",
    listDoesNotExist: "Listan du letar efter finns inte eller har raderats",
    failedToLoadList: "Kunde inte ladda listdetaljer",
    itemAdded: "Vara tillagd",
    newItemAdded: "Ny vara har lagts till i din lista",
    itemRemoved: "Vara borttagen",
    itemHasBeenRemoved: "Varan har tagits bort från din lista",
    failedToAddItem: "Kunde inte lägga till vara",
    failedToRemoveItem: "Kunde inte ta bort vara",
    failedToUpdateItem: "Kunde inte uppdatera vara",
    itemUpdated: "Vara uppdaterad",
    itemHasBeenUpdated: "Varan har uppdaterats",
    itemsAlphabetically: "Varorna har sorterats alfabetiskt",
    itemsByCategory: "Varorna har sorterats efter kategori",
    customSorting: "Bytt till anpassat sorteringsläge",
    profilePictureUpdated: "Profilbild uppdaterad",
    profilePictureSuccess: "Din profilbild har uppdaterats.",
    shareApp: "Dela app",
    supportAndFeedback: "Support och feedback",
    privacyPolicy: "Integritetspolicy",
    thankYou: "Tack!",
    ratingSoon: "Betygsfunktionen kommer snart.",
    success: "Lyckades",
    thanksForSharing: "Tack för att du delar!",
    linkCopied: "Länk kopierad!",
    appLinkCopied: "Applänken har kopierats till urklipp",
    couldntShare: "Kunde inte dela",
    tryToCopy: "Försök att kopiera länken istället",
    account: "Konto"
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
  // Set Swedish as the default language
  const [language, setLanguage] = useState<LanguageCode>('sv');
  
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
