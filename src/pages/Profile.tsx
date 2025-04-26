import React, { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import SettingsDialog from "@/components/profile/SettingsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "@/hooks/use-translation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const username = user?.email?.split("@")[0] || "username";

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "Quicklist2",
      text: "Check out this awesome grocery list app!",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Success",
          description: "Thanks for sharing!",
        });
      } else {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          toast({
            title: "Link copied!",
            description: "The app link has been copied to your clipboard",
          });
        } else {
          window.open(shareData.url, "_blank");
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Couldn't share",
          description: "Please try copying the link instead",
          variant: "destructive",
        });
      }
    }
  };

  const handleRate = () => {
    toast({
      title: "Thank you!",
      description: "Rating functionality will be implemented soon.",
    });
  };

  const handleFeedback = () => {
    setSettingsOpen(true);
  };

  const handlePrivacy = () => {
    navigate("/privacy");
  };

  const handleAvatarChange = async (file: File, url: string) => {
    setAvatarUrl(url);
  };

  return (
    <div className="min-h-screen pt-7 pb-20 px-2 bg-background max-w-md mx-auto flex flex-col">
      <ProfileHeader
        username={username}
        avatarUrl={avatarUrl}
        onAvatarChange={handleAvatarChange}
      />
      <div className="flex-1">
        <ProfileActions
          onOpenSettings={() => setSettingsOpen(true)}
          onShare={handleShare}
          onRate={handleRate}
          onFeedback={handleFeedback}
          onPrivacy={handlePrivacy}
        />
      </div>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
};

export default Profile;
