
import { MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function TabContentShared() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <MessageSquare className="h-12 w-12 text-muted-foreground/60 mb-3" />
      <p className="text-foreground">{t("noSharedListsYet")}</p>
      <p className="text-sm mt-2 text-muted-foreground">{t("createGroupToShareLists")}</p>
    </div>
  );
}
