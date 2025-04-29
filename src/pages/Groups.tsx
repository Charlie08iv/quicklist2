
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserGroups } from "@/services/groups";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, verifyAuth } from "@/integrations/supabase/client";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { GroupActions } from "@/components/groups/GroupActions";
import { LoginPrompt } from "@/components/groups/LoginPrompt";
import { GroupsTabsContent } from "@/components/groups/GroupsTabsContent";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

const Groups: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn, isLoading: authLoading, refreshSession, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [sessionError, setSessionError] = useState<boolean>(false);
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);
  
  // Verify Supabase initialization on mount
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { isAuthenticated } = await verifyAuth();
        console.log("Supabase client verification complete:", isAuthenticated ? "Authenticated" : "Not authenticated");
        setSupabaseInitialized(true);
      } catch (e) {
        console.error("Failed to verify Supabase client:", e);
        setSupabaseInitialized(true); // Set to true anyway to not block the UI
      }
    };
    
    checkSupabase();
  }, []);
  
  // Open join dialog with code if provided in URL
  useEffect(() => {
    if (inviteCode && !joinDialogOpen && isLoggedIn && !authLoading && authInitialized) {
      setJoinDialogOpen(true);
    }
  }, [inviteCode, joinDialogOpen, isLoggedIn, authLoading, authInitialized]);

  // Enhanced loadGroups function with extensive logging
  const loadGroups = useCallback(async () => {
    if (!authInitialized) {
      console.log("Auth not yet initialized, deferring group fetch");
      return;
    }
    
    if (authLoading) {
      console.log('Auth is still loading, deferring group fetch');
      return;
    }
    
    const authState = {
      isLoggedIn,
      authLoading,
      userId: user?.id,
      authInitialized
    };
    
    console.log('Loading groups - Auth state:', authState);
    
    // Verify session explicitly to ensure we have valid credentials
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      const sessionExists = !!sessionData?.session;
      console.log('Session check result:', { 
        hasSession: sessionExists, 
        userId: sessionData?.session?.user?.id,
        error: sessionError?.message || 'none'
      });
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Session error: " + sessionError.message);
        setSessionError(true);
        setLoading(false);
        return;
      }
      
      if (!sessionExists) {
        console.log("No active session found");
        setGroups([]);
        setLoading(false);
        setFetchAttempted(true);
        
        if (isLoggedIn) {
          // This indicates a mismatch between our isLoggedIn state and actual session
          setSessionError(true);
          setError("Session state mismatch. Please refresh your session.");
          await refreshSession();
        } else {
          // User is not logged in and that's expected
          setError(null);
          setSessionError(false);
        }
        return;
      }
      
      setError(null);
      setSessionError(false);
      
      const userId = sessionData.session.user.id;
      console.log('Starting group fetch for user:', userId);
      
      // Call the fetchUserGroups function with proper error handling
      try {
        const fetchedGroups = await fetchUserGroups();
        console.log('Groups fetch result:', fetchedGroups);
        
        setGroups(fetchedGroups || []);
        setFetchAttempted(true);
        
        if (!fetchedGroups || fetchedGroups.length === 0) {
          console.log('No groups found for user');
        }
      } catch (error: any) {
        console.error("Error loading groups:", error);
        setError(error.message || "Failed to load groups. Please try again.");
        
        if (error.message?.includes('session') || error.message?.includes('logged in')) {
          setSessionError(true);
          await refreshSession();
        } else {
          toast.error(t("errorLoadingGroups"));
        }
      } finally {
        // Ensure loading is always set to false at the end
        setLoading(false);
      }
    } catch (outerError) {
      console.error("Unexpected error during groups fetch:", outerError);
      setError("Unexpected error: " + (outerError instanceof Error ? outerError.message : String(outerError)));
      setLoading(false);
    }
    
  }, [isLoggedIn, authLoading, user, t, refreshSession, authInitialized]);

  // Load groups when component mounts or auth status changes
  useEffect(() => {
    console.log('Groups component useEffect triggered - Auth state:', {
      isLoggedIn,
      authLoading,
      userId: user?.id,
      authInitialized,
      supabaseInitialized
    });
    
    // Only attempt to load groups once auth is initialized and no longer loading
    if (authInitialized && !authLoading && supabaseInitialized) {
      loadGroups();
    }
  }, [loadGroups, authLoading, isLoggedIn, authInitialized, supabaseInitialized]);

  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate("/auth");
  };
  
  // Handle refresh session
  const handleRefreshSession = async () => {
    await refreshSession();
    loadGroups();
    toast.success(t("sessionRefreshed"));
  };

  // Show loading state if auth is not initialized or Supabase is not initialized
  if (!authInitialized || !supabaseInitialized) {
    return (
      <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-foreground">{t("groups")}</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {!authInitialized ? "Initializing authentication..." : "Connecting to database..."}
          </p>
        </div>
      </div>
    );
  }

  // Render the component
  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("groups")}</h1>
      
      {/* Authentication status indicator */}
      <Alert className="mb-4 bg-gray-50">
        <AlertDescription className="flex items-center justify-between">
          <span>
            Status: {isLoggedIn ? (
              <span className="text-green-600 font-medium">Logged in as {user?.email}</span>
            ) : (
              <span className="text-amber-600 font-medium">Not logged in</span>
            )}
          </span>
          {!isLoggedIn && (
            <Button size="sm" variant="outline" onClick={handleLoginRedirect}>
              Log in
            </Button>
          )}
        </AlertDescription>
      </Alert>
      
      {/* Display session error with refresh button */}
      {sessionError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-yellow-800">{error}</div>
          <Button size="sm" variant="outline" onClick={handleRefreshSession} className="flex items-center gap-2">
            <RefreshCcw size={16} />
            {t("refreshSession")}
          </Button>
        </div>
      )}
      
      <GroupActions 
        onJoinClick={() => setJoinDialogOpen(true)} 
        onCreateClick={() => setCreateDialogOpen(true)} 
      />

      {!isLoggedIn ? (
        <LoginPrompt onLoginClick={handleLoginRedirect} />
      ) : (
        <GroupsTabsContent
          groups={groups}
          loading={loading}
          authLoading={authLoading}
          error={!sessionError ? error : null}
          debugInfo={debugInfo}
          onRetry={loadGroups}
          fetchAttempted={fetchAttempted}
          onCreateClick={() => setCreateDialogOpen(true)}
          onGroupDeleted={loadGroups}
        />
      )}

      <CreateGroupDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        onGroupCreated={loadGroups} 
      />
      
      <JoinGroupDialog 
        open={joinDialogOpen} 
        onOpenChange={setJoinDialogOpen} 
        onGroupJoined={loadGroups} 
      />
    </div>
  );
};

export default Groups;
