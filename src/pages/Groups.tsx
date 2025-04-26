
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus, Users } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Group {
  id: string;
  name: string;
  created_at: string;
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
    if (!user) return;
    
    setLoading(true);
    try {
      // Get groups the user has created or is a member of
      const { data: memberGroups, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
        
      if (memberError) throw memberError;
      
      if (memberGroups && memberGroups.length > 0) {
        const groupIds = memberGroups.map(item => item.group_id);
        
        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .in("id", groupIds);
          
        if (error) throw error;
        setGroups(data || []);
      } else {
        setGroups([]);
      }
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast.error(t("Error fetching your groups"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("groups")}</h1>
      
      <div className="flex gap-4 mb-8">
        <Button 
          className="flex-1 flex flex-col items-center justify-center py-6"
          variant="outline"
          onClick={() => setJoinDialogOpen(true)}
        >
          <UserCircle2 className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">{t("joinGroup")}</span>
        </Button>

        <Button 
          className="flex-1 flex flex-col items-center justify-center py-6"
          variant="outline"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">{t("createGroup")}</span>
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("yourGroups")}</h2>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("Loading...")}</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Card 
                key={group.id} 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/groups/${group.id}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{group.name}</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(group.created_at).toLocaleDateString()}
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
        onOpenChange={setCreateDialogOpen}
        onGroupCreated={fetchGroups}
      />
      
      <JoinGroupDialog 
        open={joinDialogOpen} 
        onOpenChange={setJoinDialogOpen}
        onGroupJoined={fetchGroups}
      />
    </div>
  );
};

export default Groups;
