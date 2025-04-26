
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus, Loader } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GroupCard } from "@/components/groups/GroupCard";

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

  const fetchGroups = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch groups created by the user
      const { data: createdGroups, error: createdError } = await supabase
        .from("groups")
        .select("*")
        .eq("created_by", user.id);

      if (createdError) throw createdError;
      
      // Fetch groups where user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", supabase.rpc('user_is_member_of_group', { group_id_param: 'id', user_id_param: user.id }));

      if (memberError) throw memberError;
      
      // Combine and deduplicate groups
      const allGroups = [...(createdGroups || [])];
      if (memberGroups) {
        memberGroups.forEach(group => {
          if (!allGroups.some(g => g.id === group.id)) {
            allGroups.push(group);
          }
        });
      }
      
      setGroups(allGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error(t("errorFetchingGroups"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleGroupCreated = () => {
    fetchGroups();
  };

  const handleGroupJoined = () => {
    fetchGroups();
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
          <div className="flex justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("noGroupsYet")}</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      <CreateGroupDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onGroupCreated={handleGroupCreated}
      />
      
      <JoinGroupDialog 
        open={joinDialogOpen} 
        onOpenChange={setJoinDialogOpen}
        onGroupJoined={handleGroupJoined}
      />
    </div>
  );
};

export default Groups;
