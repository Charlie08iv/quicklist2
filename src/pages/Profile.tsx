
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
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const username = user?.email?.split("@")[0] || "username";
  const email = user?.email || "";

  // Avatar preview logic (UI only; backend integration needed for storage)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Dialog/modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Action handlers
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
        // Fallback for browsers that don't support native sharing
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
      // Don't show error for user cancellation
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
    setSettingsOpen(true); // For simplicity, direct to settings
  };

  const handlePrivacy = () => {
    navigate("/privacy"); // Navigate to internal privacy page
  };

  const handleAvatarChange = async (file: File, url: string) => {
    setAvatarUrl(url);
    
    // Here we would upload to Supabase storage if configured
    // const { error } = await supabase.storage
    //   .from('avatars')
    //   .upload(`${user!.id}/avatar.png`, file);
    
    // if (error) {
    //   toast({
    //     title: "Upload failed",
    //     description: error.message,
    //     variant: "destructive"
    //   });
    // }
  };

  return (
    <div className="min-h-screen pt-7 pb-20 px-2 bg-background max-w-md mx-auto flex flex-col">
      <ProfileHeader
        username={username}
        email={email}
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
