
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus, Users } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserGroups } from "@/services/groupService";
import { GroupCard } from "@/components/groups/GroupCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

const Groups: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groups");
  
  const loadGroups = async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading groups for user:', user.id);
      const fetchedGroups = await fetchUserGroups();
      console.log('Fetched groups:', fetchedGroups);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error(t("errorLoadingGroups")); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Groups component mounted, user:', user);
    loadGroups();
  }, [user]);
  
  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("groups")}</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card 
          className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed"
          onClick={() => setJoinDialogOpen(true)}
        >
          <UserCircle2 className="h-8 w-8 mb-2 text-muted-foreground" />
          <span className="text-sm font-medium">{t("joinGroup")}</span>
        </Card>

        <Card 
          className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
          <span className="text-sm font-medium">{t("createGroup")}</span>
        </Card>
      </div>

      <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="groups">{t("yourGroups")}</TabsTrigger>
          <TabsTrigger value="shared">{t("sharedLists")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
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
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
              <p>{t("noGroupsYet")}</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shared">
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("comingSoon")}</p>
          </div>
        </TabsContent>
      </Tabs>

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
