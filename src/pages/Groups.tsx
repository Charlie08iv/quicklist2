
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
  
  // Open join dialog with code if provided in URL
  useEffect(() => {
    if (inviteCode && !joinDialogOpen && isLoggedIn && !authLoading) {
      setJoinDialogOpen(true);
    }
  }, [inviteCode, joinDialogOpen, isLoggedIn, authLoading]);

  const loadGroups = useCallback(async () => {
    console.log('Loading groups - Auth state:', {
      isLoggedIn,
      authLoading,
      userId: user?.id
    });
    
    if (authLoading) {
      console.log('Auth is still loading, deferring group fetch');
      return;
    }
    
    if (!isLoggedIn) {
      console.log('User is not logged in, skipping group fetch');
      setGroups([]);
      setLoading(false);
      setFetchAttempted(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSessionError(false);
    
    try {
      // Verify session directly
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
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

      // Use the service function
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
