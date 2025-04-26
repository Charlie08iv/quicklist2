
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { UserCircle2, Plus } from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";

const Groups: React.FC = () => {
  const { t } = useTranslation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

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
        <div className="text-center py-12 text-muted-foreground">
          <p>{t("noGroupsYet")}</p>
        </div>
      </div>

      <CreateGroupDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      <JoinGroupDialog 
        open={joinDialogOpen} 
        onOpenChange={setJoinDialogOpen} 
      />
    </div>
  );
};

export default Groups;
