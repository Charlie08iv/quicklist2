
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus, User2 } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  created_at: string;
  invite_code: string;
  created_by: string; // Added this missing property
}

const Groups: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log("Fetching groups for user:", user.id);
      
      // Get groups created by the user
      const { data: createdGroups, error: createdError } = await supabase
        .from("groups")
        .select("*")
        .eq("created_by", user.id);
      
      if (createdError) {
        console.error("Error fetching created groups:", createdError);
        throw createdError;
      }

      console.log("Created groups:", createdGroups);

      // Get groups the user is a member of
      const { data: memberGroups, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      
      if (memberError) {
        console.error("Error fetching member groups:", memberError);
        throw memberError;
      }

      console.log("Member of groups:", memberGroups);

      // If user is a member of any groups, get those group details
      let joinedGroups: Group[] = [];
      if (memberGroups && memberGroups.length > 0) {
        const groupIds = memberGroups.map(m => m.group_id);
        console.log("Fetching details for groups:", groupIds);
        
        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*")
          .in("id", groupIds);
        
        if (groupsError) {
          console.error("Error fetching group details:", groupsError);
          throw groupsError;
        }
        
        joinedGroups = groupsData || [];
        console.log("Joined groups details:", joinedGroups);
      }

      // Combine and deduplicate groups
      const allGroups = [...(createdGroups || [])];
      if (joinedGroups.length > 0) {
        joinedGroups.forEach(joinedGroup => {
          if (!allGroups.some(g => g.id === joinedGroup.id)) {
            allGroups.push(joinedGroup);
          }
        });
      }
      
      console.log("All groups after combining:", allGroups);
      setGroups(allGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error(t("errorFetchingGroups"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroups();
      
      // Set up subscription to real-time updates
      const channel = supabase
        .channel("group-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "groups" },
          (payload) => {
            console.log("Group change detected:", payload);
            fetchGroups();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "group_members" },
          (payload) => {
            console.log("Group membership change detected:", payload);
            fetchGroups();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  // Update DialogOpen callbacks to refresh the groups list
  const handleCreateDialogChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) fetchGroups();
  };

  const handleJoinDialogChange = (open: boolean) => {
    setJoinDialogOpen(open);
    if (!open) fetchGroups();
  };

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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("yourGroups")}</h2>
        {loading ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>{t("loading")}</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Card 
                key={group.id}
                className="p-4 hover:bg-accent/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <User2 className="h-10 w-10 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("noGroupsYet")}</p>
          </div>
        )}
      </div>

      <CreateGroupDialog 
        open={createDialogOpen} 
        onOpenChange={handleCreateDialogChange} 
      />
      
      <JoinGroupDialog 
        open={joinDialogOpen} 
        onOpenChange={handleJoinDialogChange} 
      />
    </div>
  );
};

export default Groups;
