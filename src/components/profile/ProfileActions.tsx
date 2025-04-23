
import React from "react";
import { Button } from "@/components/ui/button";
import { Star, Share, Mail, FileText, Settings } from "lucide-react";

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
  return (
    <div className="flex flex-col gap-3 w-full px-3 max-w-md mx-auto">
      <Button
        className="rounded-xl bg-card text-lg border shadow hover:bg-accent/30 transition"
        onClick={onOpenSettings}
        variant="outline"
        type="button"
      >
        <Settings className="mr-2 w-5 h-5" />
        Settings
      </Button>
      <div className="rounded-xl bg-card border shadow flex items-center justify-between p-3">
        <span className="font-medium">Light mode</span>
        <span className="text-muted-foreground text-xs">Switch to dark mode</span>
        {/* Switch handled in settings */}
      </div>
      <Button
        className="rounded-xl bg-primary text-white text-lg font-medium shadow hover:bg-primary/80 transition"
        onClick={onShare}
        type="button"
      >
        <Share className="mr-2 w-4 h-4" />
        Share app
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex rounded-xl bg-card text-lg border shadow hover:bg-accent/30 transition items-center justify-center"
        onClick={onRate}
      >
        <Star className="mr-2 w-5 h-5" /> Rate the app!
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex rounded-xl bg-card border shadow hover:bg-accent/30 transition items-center justify-center"
        onClick={onFeedback}
      >
        <Mail className="mr-2 w-5 h-5" /> Support and feedback
      </Button>
      <Button
        type="button"
        variant="link"
        className="font-normal text-muted-foreground text-left pl-0"
        onClick={onPrivacy}
      >
        <FileText className="mr-2 w-4 h-4" />
        Privacy Policy
      </Button>
    </div>
  );
};

export default ProfileActions;

