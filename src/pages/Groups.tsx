
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus, User2 } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  created_at: string;
  invite_code: string;
  created_by: string;
}

const Groups: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching groups for user:", user.id);
      
      // Get all groups the user is a member of through group_members table
      const { data: membershipData, error: membershipError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      
      if (membershipError) {
        console.error("Error fetching group memberships:", membershipError);
        throw membershipError;
      }

      console.log("User group memberships:", membershipData);
      
      // If user isn't a member of any groups, return an empty array
      if (!membershipData || membershipData.length === 0) {
        console.log("User is not a member of any groups");
        setGroups([]);
        setLoading(false);
        return;
      }
      
      // Extract group IDs
      const groupIds = membershipData.map(item => item.group_id);
      
      // Fetch details for those groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);
      
      if (groupsError) {
        console.error("Error fetching groups details:", groupsError);
        throw groupsError;
      }
      
      console.log("Fetched groups:", groupsData);
      setGroups(groupsData || []);
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
