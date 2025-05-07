
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TranslationProvider } from "./hooks/use-translation";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import Lists from "./pages/Lists";
import Recipes from "./pages/Recipes";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import ListDetails from "./pages/ListDetails";
import SharedListView from "./pages/SharedListView";
import Account from "./pages/Account";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <TranslationProvider>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner position="top-center" />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/lists" element={<AppLayout />}>
                  <Route index element={<Lists />} />
                  <Route path=":listId" element={<ListDetails />} />
                </Route>
                <Route path="/list/:listId" element={<Navigate to="/lists/:listId" replace />} />
                
                {/* New dedicated route for shared lists */}
                <Route path="/shared-list/:listId" element={<SharedListView />} />
                
                <Route path="/recipes" element={<AppLayout />}>
                  <Route index element={<Recipes />} />
                </Route>
                <Route path="/groups" element={<AppLayout />}>
                  <Route index element={<Groups />} />
                  <Route path="join" element={<Groups />} />
                  {/* Add routes for group features - these will be implemented later */}
                  <Route path=":groupId/lists" element={<NotFound />} />
                  <Route path=":groupId/chat" element={<NotFound />} />
                  <Route path=":groupId/wishlist" element={<NotFound />} />
                </Route>
                <Route
                  path="/profile"
                  element={<AppLayout />}
                >
                  <Route index element={<Profile />} />
                </Route>
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Account />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </TooltipProvider>
        </TranslationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
