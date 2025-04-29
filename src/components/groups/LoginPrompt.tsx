
import { InfoIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface LoginPromptProps {
  onLoginClick: () => void;
}

export function LoginPrompt({ onLoginClick }: LoginPromptProps) {
  const { t } = useTranslation();

  return (
    <>
      <Alert className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle className="text-foreground">{t("notLoggedIn")}</AlertTitle>
        <AlertDescription className="text-foreground">
          {t("loginToAccessGroups")}
        </AlertDescription>
      </Alert>
      <Button onClick={onLoginClick}>
        {t("login")}
      </Button>
    </>
  );
}
