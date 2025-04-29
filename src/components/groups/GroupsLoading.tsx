
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupsLoadingProps {
  type: "auth" | "groups";
}

export function GroupsLoading({ type }: GroupsLoadingProps) {
  const { t } = useTranslation();

  if (type === "auth") {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Skeleton className="h-[100px] w-full" />
      <Skeleton className="h-[100px] w-full" />
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">{t("loadingGroups")}</p>
      </div>
    </div>
  );
}
