
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserGroups } from "@/services/groups";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { GroupActions } from "@/components/groups/GroupActions";
import { LoginPrompt } from "@/components/groups/LoginPrompt";
import { GroupsTabsContent } from "@/components/groups/GroupsTabsContent";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

const Groups: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn, isLoading: authLoading, refreshSession } = useAuth();
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
  
  // Debug state for temporary display
  const [authDebug, setAuthDebug] = useState<string>("");
  
  // Open join dialog with code if provided in URL
  useEffect(() => {
    if (inviteCode && !joinDialogOpen && isLoggedIn && !authLoading) {
      setJoinDialogOpen(true);
    }
  }, [inviteCode, joinDialogOpen, isLoggedIn, authLoading]);

  // Enhanced loadGroups function with extensive logging
  const loadGroups = useCallback(async () => {
    const authState = {
      isLoggedIn,
      authLoading,
      userId: user?.id,
      sessionExists: false
    };
    
    console.log('Loading groups - Auth state:', authState);
    setAuthDebug(`Auth state: ${JSON.stringify(authState)}`);
    
    if (authLoading) {
      console.log('Auth is still loading, deferring group fetch');
      return;
    }
    
    // Verify session explicitly to ensure we have valid credentials
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      authState.sessionExists = !!sessionData?.session;
      console.log('Session check result:', { 
        hasSession: authState.sessionExists, 
        userId: sessionData?.session?.user?.id,
        error: sessionError?.message || 'none'
      });
      
      setAuthDebug(`Session check: ${authState.sessionExists ? 'Valid' : 'Invalid'} - ${sessionData?.session?.user?.id || 'No user'}`);
      
      if (!isLoggedIn || !authState.sessionExists) {
        console.log('User is not logged in or no valid session, skipping group fetch');
        setGroups([]);
        setLoading(false);
        setFetchAttempted(true);
        
        if (isLoggedIn && !authState.sessionExists) {
          // This indicates a mismatch between our isLoggedIn state and actual session
          setSessionError(true);
          setError("Session state mismatch. Please refresh your session.");
          await refreshSession();
        }
        return;
      }
      
      setLoading(true);
      setError(null);
      setSessionError(false);
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Session error: " + sessionError.message);
        setSessionError(true);
        setLoading(false);
        return;
      }
      
      if (!sessionData.session) {
        console.log("No active session found");
        setGroups([]);
        setLoading(false);
        setFetchAttempted(true);
        setSessionError(true);
        setError("Your session has expired. Please refresh your session.");
        return;
      }
      
      const userId = sessionData.session.user.id;
      console.log('Starting group fetch for user:', userId);
      
      // Test if profile exists and create if needed
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
          
        console.log('Profile check result:', { exists: !!profileData, error: profileError?.message || 'none' });
          
        if (!profileData && !profileError) {
          console.log('Creating profile for user:', userId);
          // Try to create a profile for the user
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId,
              email: sessionData.session.user.email
            });
            
          if (createProfileError) {
            console.error('Error creating profile:', createProfileError);
            // Continue anyway, the group fetch might still work
          } else {
            console.log('Profile created successfully');
          }
        }
      } catch (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
        // Continue with groups fetch anyway
      }
      
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
    
  }, [isLoggedIn, authLoading, user, t, refreshSession]);

  // Load groups when component mounts or auth status changes
  useEffect(() => {
    console.log('Groups component useEffect triggered - Auth state:', {
      isLoggedIn,
      authLoading,
      userId: user?.id
    });
    
    // Important: Only attempt to load groups once auth is no longer loading
    if (!authLoading) {
      loadGroups();
    }
  }, [loadGroups, authLoading, isLoggedIn]);

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

  // Render the component
  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("groups")}</h1>
      
      {/* Debug display - temporary for troubleshooting */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md text-xs font-mono overflow-auto">
          <p>Auth debug: {authDebug}</p>
          <p>Auth loading: {authLoading ? 'true' : 'false'}</p>
          <p>Is logged in: {isLoggedIn ? 'true' : 'false'}</p>
          <p>User ID: {user?.id || 'none'}</p>
          <p>Loading state: {loading ? 'true' : 'false'}</p>
          <p>Fetch attempted: {fetchAttempted ? 'true' : 'false'}</p>
        </div>
      )}
      
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

      {!isLoggedIn && !authLoading ? (
        <LoginPrompt onLoginClick={handleLoginRedirect} />
      ) : (
        <GroupsTabsContent
          groups={groups}
          loading={loading || authLoading}
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
