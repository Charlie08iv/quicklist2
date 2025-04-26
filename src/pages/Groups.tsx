
import React from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle2, Plus } from "lucide-react";

const Groups: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("groups")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed">
          <UserCircle2 className="h-12 w-12 mb-3 text-muted-foreground" />
          <span className="text-lg font-medium">{t("joinGroup")}</span>
          <p className="text-sm text-muted-foreground mt-1">{t("joinExistingGroup")}</p>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center hover:bg-accent/50 transition-colors cursor-pointer border-dashed">
          <Plus className="h-12 w-12 mb-3 text-muted-foreground" />
          <span className="text-lg font-medium">{t("createGroup")}</span>
          <p className="text-sm text-muted-foreground mt-1">{t("startNewGroup")}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("yourGroups")}</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>{t("noGroupsYet")}</p>
        </div>
      </div>
    </div>
  );
};

export default Groups;
