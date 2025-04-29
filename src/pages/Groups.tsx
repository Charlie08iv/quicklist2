
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus, Users, MessageSquare, Heart } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserGroups } from "@/services/groupService";
import { GroupCard } from "@/components/groups/GroupCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

const Groups: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn, isLoading: authLoading, initialized } = useAuth();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groups");
  const [error, setError] = useState<string | null>(null);
  
  const loadGroups = useCallback(async () => {
    // Don't try to load groups if auth isn't initialized yet
    if (!initialized) {
      console.log("Auth not initialized yet, waiting...");
      return;
    }
    
    // Clear groups if not logged in
    if (!isLoggedIn) {
      console.log("Not logged in, clearing groups");
      setGroups([]);
      setLoading(false);
      return;
    }

    console.log("Loading groups for user:", user?.id);
    setLoading(true);
    setError(null);
    
    try {
      const fetchedGroups = await fetchUserGroups();
      console.log('Fetched groups:', fetchedGroups);
      setGroups(fetchedGroups || []);
    } catch (error: any) {
      console.error("Error loading groups:", error);
      const errorMessage = error.message || "Failed to load groups. Please try again.";
      setError(errorMessage);
      toast.error(t("errorLoadingGroups")); 
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, initialized, user, t]);

  // Load groups when component mounts or auth status changes
  useEffect(() => {
    if (initialized) {
      console.log("Auth initialized, loading groups");
      loadGroups();
    }
  }, [loadGroups, initialized, isLoggedIn]);
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate("/auth");
  };
  
  // Display loading state during auth initialization
  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen pt-4 pb-20 px-4 max-w-4xl mx-auto flex justify-center items-center">
        <div className="w-full text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }
  
  // Display login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-4 pb-20 px-4 max-w-4xl mx-auto flex flex-col justify-center items-center">
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
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("groups")}</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card 
          className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed text-foreground"
          onClick={() => setJoinDialogOpen(true)}
        >
          <UserCircle2 className="h-8 w-8 mb-2 text-muted-foreground" />
          <span className="text-sm font-medium">{t("joinGroup")}</span>
        </Card>

        <Card 
          className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed text-foreground"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
          <span className="text-sm font-medium">{t("createGroup")}</span>
        </Card>
      </div>

      <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="groups" className="text-foreground">{t("yourGroups")}</TabsTrigger>
          <TabsTrigger value="shared" className="text-foreground">{t("sharedLists")}</TabsTrigger>
          <TabsTrigger value="wishlist" className="text-foreground">{t("wishlist")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : groups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group}
                  onDeleted={loadGroups}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
              <p className="text-foreground">{t("noGroupsYet")}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setCreateDialogOpen(true)}
              >
                {t("createYourFirstGroup")}
              </Button>
            </div>
          )}
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

      {/* Auth status debugger */}
      <div className="mt-8 p-4 border border-dashed rounded-md bg-muted/30">
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug Information</summary>
          <div className="pt-2 space-y-1">
            <p>Auth Initialized: {initialized ? "Yes" : "No"}</p>
            <p>Auth Loading: {authLoading ? "Yes" : "No"}</p>
            <p>Logged In: {isLoggedIn ? "Yes" : "No"}</p>
            <p>User ID: {user?.id || "None"}</p>
            <p>Groups Loading: {loading ? "Yes" : "No"}</p>
            <p>Groups Count: {groups.length}</p>
            <p>Error: {error || "None"}</p>
          </div>
        </details>
      </div>

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
