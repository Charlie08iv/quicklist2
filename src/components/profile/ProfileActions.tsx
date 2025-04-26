
import React from "react";
import { Button } from "@/components/ui/button";
import { User, Share, Mail, FileText, Settings, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";

type ProfileActionsProps = {
  onOpenSettings: () => void;
  onShare: () => void;
  onRate: () => void;
  onFeedback: () => void;
  onPrivacy: () => void;
};

const ProfileActions: React.FC<ProfileActionsProps> = ({
  onOpenSettings,
  onShare,
  onRate,
  onFeedback,
  onPrivacy,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 w-full px-3 max-w-md mx-auto">
      <Button
        className="rounded-xl bg-card text-lg border shadow hover:bg-accent/30 transition"
        onClick={onOpenSettings}
        variant="outline"
        type="button"
      >
        <Settings className="mr-2 w-5 h-5" />
        {t("settings")}
      </Button>
      <Button
        className="rounded-xl bg-card text-lg border shadow hover:bg-accent/30 transition"
        onClick={() => navigate('/account')}
        variant="outline"
        type="button"
      >
        <User className="mr-2 w-5 h-5" />
        {t("account")}
      </Button>
      <Button
        className="rounded-xl bg-primary text-white text-lg font-medium shadow hover:bg-primary/80 transition"
        onClick={onShare}
        type="button"
      >
        <Share className="mr-2 w-4 h-4" />
        {t("shareApp")}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex rounded-xl bg-card text-lg border shadow hover:bg-accent/30 transition items-center justify-center"
        onClick={onRate}
      >
        <Star className="mr-2 w-5 h-5" /> {t("rateTheApp")}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex rounded-xl bg-card border shadow hover:bg-accent/30 transition items-center justify-center"
        onClick={onFeedback}
      >
        <Mail className="mr-2 w-5 h-5" /> {t("supportAndFeedback")}
      </Button>
      <Button
        type="button"
        variant="link"
        className="font-normal text-muted-foreground text-left pl-0"
        onClick={onPrivacy}
      >
        <FileText className="mr-2 w-4 h-4" />
        {t("privacyPolicy")}
      </Button>
    </div>
  );
};

export default ProfileActions;
