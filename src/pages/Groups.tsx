
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
    if (inviteCode && !joinDialogOpen) {
      setJoinDialogOpen(true);
    }
  }, [inviteCode, joinDialogOpen]);

  const loadGroups = useCallback(async () => {
    console.log('Loading groups - Auth state:', {
      isLoggedIn,
      authLoading,
      userId: user?.id
    });
    
    setLoading(true);
    setError(null);
    setSessionError(false);
    
    try {
      // Get current auth session directly to verify
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("Current session check:", {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        error: sessionError
      });
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Session error: " + sessionError.message);
        setSessionError(true);
        setLoading(false);
        return;
      }
      
      const activeSession = sessionData.session;
      
      // Show empty groups for guests or if no session
      if (!activeSession) {
        console.log("No active session, showing empty groups");
        setGroups([]);
        setLoading(false);
        setFetchAttempted(true);
        
        // If we expected to be logged in but aren't, show session error
        if (isLoggedIn) {
          console.log("Session mismatch: Auth hook thinks user is logged in but no active session found");
          setSessionError(true);
          setError("Your session may have expired. Please refresh your session.");
        }
        return;
      }
      
      console.log('Starting group fetch for user:', activeSession?.user?.id);

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
      toast.error(t("errorLoadingGroups"));
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading, user, t]);

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
  }, [loadGroups, authLoading]);

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
