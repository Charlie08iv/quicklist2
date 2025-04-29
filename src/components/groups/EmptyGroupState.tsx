
import { Users } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";

interface EmptyGroupStateProps {
  onCreateClick: () => void;
}

export function EmptyGroupState({ onCreateClick }: EmptyGroupStateProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
      <p className="text-foreground">{t("noGroupsYet")}</p>
      <Button variant="outline" className="mt-4" onClick={onCreateClick}>
        {t("createYourFirstGroup")}
      </Button>
    </div>
  );
}
