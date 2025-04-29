
import { InfoIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface GroupsErrorDisplayProps {
  error: string;
  debugInfo?: any;
  onRetry: () => void;
}

export function GroupsErrorDisplay({ error, debugInfo, onRetry }: GroupsErrorDisplayProps) {
  const { t } = useTranslation();

  return (
    <Alert variant="destructive" className="mb-4">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>{t("error")}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error}</p>
        {debugInfo && (
          <div className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
            <p>Debug info:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        <Button size="sm" variant="outline" onClick={onRetry}>
          {t("retry")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
