
import React, { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import SettingsDialog from "@/components/profile/SettingsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "@/hooks/use-translation";

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useTranslation();

  const username = user?.email?.split("@")[0] || "username";
  const email = user?.email || "";

  // Avatar preview logic (UI only; backend integration needed for storage)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Dialog/modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Action handlers
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Grocery App",
        url: window.location.origin,
      });
    } else {
      window.open(window.location.origin, "_blank");
    }
  };

  const handleRate = () => {
    alert("App rating not implemented yet.");
  };

  const handleFeedback = () => {
    setSettingsOpen(true); // For simplicity, direct to settings
  };

  const handlePrivacy = () => {
    window.open("https://yourdomain.com/privacy", "_blank");
  };

  return (
    <div className="min-h-screen pt-7 pb-20 px-2 bg-background max-w-md mx-auto flex flex-col">
      <ProfileHeader
        username={username}
        email={email}
        avatarUrl={avatarUrl}
        onAvatarChange={(_, url) => setAvatarUrl(url)}
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
        email={email}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        onLogout={signOut}
      />
    </div>
  );
};

export default Profile;

