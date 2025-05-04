
import React, { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import SettingsDialog from "@/components/profile/SettingsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation, LanguageCode } from "@/hooks/use-translation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const username = user?.email?.split("@")[0] || "username";

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "Quicklist2",
      text: t("Check out this awesome grocery list app!"),
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: t("success"),
          description: t("thanksForSharing"),
        });
      } else {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          toast({
            title: t("linkCopied"),
            description: t("appLinkCopied"),
          });
        } else {
          window.open(shareData.url, "_blank");
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: t("couldntShare"),
          description: t("tryToCopy"),
          variant: "destructive",
        });
      }
    }
  };

  const handleRate = () => {
    toast({
      title: t("thankYou"),
      description: t("ratingSoon"),
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
    toast({
      title: t("profilePictureUpdated"),
      description: t("profilePictureSuccess"),
    });
  };
  
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as LanguageCode);
  };

  return (
    <div className="min-h-screen pt-7 pb-20 px-2 bg-background max-w-md mx-auto flex flex-col text-foreground">
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
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={setTheme}
        email={user?.email}
      />
    </div>
  );
};

export default Profile;
