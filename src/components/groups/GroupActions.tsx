
import { UserCircle2, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";

interface GroupActionsProps {
  onJoinClick: () => void;
  onCreateClick: () => void;
}

export function GroupActions({ onJoinClick, onCreateClick }: GroupActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <Card 
        className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed text-foreground" 
        onClick={onJoinClick}
      >
        <UserCircle2 className="h-8 w-8 mb-2 text-muted-foreground" />
        <span className="text-sm font-medium">{t("joinGroup")}</span>
      </Card>

      <Card 
        className="p-4 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed text-foreground" 
        onClick={onCreateClick}
      >
        <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
        <span className="text-sm font-medium">{t("createGroup")}</span>
      </Card>
    </div>
  );
}
