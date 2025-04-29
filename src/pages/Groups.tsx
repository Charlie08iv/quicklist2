import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus, Users, MessageSquare, Heart } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserGroups } from "@/services/groupService";
import { GroupCard } from "@/components/groups/GroupCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}
const Groups: React.FC = () => {
  const {
    t
  } = useTranslation();
  const {
    user,
    isLoggedIn,
    isLoading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groups");
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const loadGroups = useCallback(async () => {
    if (!isLoggedIn && !authLoading) {
      console.log('Not logged in, skipping group fetch');
      return;
    }
    console.log('Loading groups - Auth state:', {
      isLoggedIn,
      authLoading,
      userId: user?.id
    });
    setLoading(true);
    setError(null);
    try {
      // Get current auth session directly to verify
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession();
      console.log("Current session check:", {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        error: sessionError
      });
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Session error: " + sessionError.message);
        setLoading(false);
        return;
      }
      const activeSession = sessionData.session;
      if (!activeSession) {
        console.log("No active session found when directly checking");
        setError("No active session detected. Please login.");
        setLoading(false);
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
    if (!authLoading || isLoggedIn) {
      loadGroups();
    }
  }, [loadGroups, authLoading, isLoggedIn]);

  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate("/auth");
  };

  // Handle retry when error occurs
  const handleRetry = () => {
    loadGroups();
  };

  // Create and show main action buttons
  const MainActions = () => <div className="grid grid-cols-2 gap-4 mb-8">
      <Card className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed text-foreground" onClick={() => setJoinDialogOpen(true)}>
        <UserCircle2 className="h-8 w-8 mb-2 text-muted-foreground" />
        <span className="text-sm font-medium">{t("joinGroup")}</span>
      </Card>

      <Card className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed text-foreground" onClick={() => setCreateDialogOpen(true)}>
        <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
        <span className="text-sm font-medium">{t("createGroup")}</span>
      </Card>
    </div>;

  // Display login prompt if not logged in
  if (!isLoggedIn && !authLoading) {
    return <div className="min-h-screen pt-4 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-foreground">{t("groups")}</h1>
        
        <MainActions />
        
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle className="text-foreground">{t("notLoggedIn")}</AlertTitle>
          <AlertDescription className="text-foreground">
            {t("loginToAccessGroups")}
          </AlertDescription>
        </Alert>
        <Button onClick={handleLoginRedirect}>
          {t("login")}
        </Button>
      </div>;
  }
  return <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("groups")}</h1>
      
      <MainActions />

      <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="groups" className="text-foreground">{t("yourGroups")}</TabsTrigger>
          <TabsTrigger value="shared" className="text-foreground">{t("sharedLists")}</TabsTrigger>
          <TabsTrigger value="wishlist" className="text-foreground">{t("wishlist")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-4">
          {authLoading}
          
          {!authLoading && loading && <div className="space-y-3">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">{t("loadingGroups")}</p>
              </div>
            </div>}
          
          {error && <Alert variant="destructive" className="mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{error}</p>
                {debugInfo && <div className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                    <p>Debug info:</p>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>}
                <Button size="sm" variant="outline" onClick={handleRetry}>
                  {t("retry")}
                </Button>
              </AlertDescription>
            </Alert>}
          
          {!authLoading && !loading && !error && groups.length > 0 && <div className="grid gap-4 md:grid-cols-2">
              {groups.map(group => <GroupCard key={group.id} group={group} onDeleted={loadGroups} />)}
            </div>}
          
          {!authLoading && !loading && !error && groups.length === 0 && fetchAttempted && <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
              <p className="text-foreground">{t("noGroupsYet")}</p>
              <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                {t("createYourFirstGroup")}
              </Button>
            </div>}
        </TabsContent>
        
        <TabsContent value="shared">
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <p className="text-foreground">{t("noSharedListsYet")}</p>
            <p className="text-sm mt-2 text-muted-foreground">{t("createGroupToShareLists")}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="wishlist">
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <p className="text-foreground">{t("noWishListsYet")}</p>
            <p className="text-sm mt-2 text-muted-foreground">{t("joinGroupToSeeWishLists")}</p>
          </div>
        </TabsContent>
      </Tabs>

      <CreateGroupDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onGroupCreated={loadGroups} />
      
      <JoinGroupDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} onGroupJoined={loadGroups} />
      
      {/* Debug info for development */}
      
    </div>;
};
export default Groups;