
import React, { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SettingsSheet from "@/components/profile/SettingsSheet";
import { useTranslation } from "@/hooks/use-translation";
import { Plus } from "lucide-react";

const Profile = () => {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  // User mock data (replace with real data fetching/auth)
  const user = {
    username: "Jane Doe",
    email: "jane@example.com",
    avatarUrl: "",
  };

  return (
    <div className="max-w-md mx-auto py-6 pb-32 px-4 space-y-6">
      <ProfileHeader
        username={user.username}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />

      <Tabs defaultValue="lists" className="w-full">
        <TabsList className="w-full mb-3 bg-secondary/40 rounded-lg grid grid-cols-2">
          <TabsTrigger value="lists" className="rounded-l-lg">{t("Saved Lists")}</TabsTrigger>
          <TabsTrigger value="recipes" className="rounded-r-lg">{t("Saved Recipes")}</TabsTrigger>
        </TabsList>
        <TabsContent value="lists">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="mb-2 text-muted-foreground">{t("No saved lists yet")}</div>
              <Button variant="outline" className="rounded-full px-8">
                <Plus className="mr-2 h-5 w-5" />
                {t("New List")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recipes">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="mb-2 text-muted-foreground">{t("No saved recipes yet")}</div>
              <Button variant="outline" className="rounded-full px-8">
                <Plus className="mr-2 h-5 w-5" />
                {t("Explore Recipes")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="w-full">
        <Button
          variant="ghost"
          size="lg"
          className="w-full rounded-xl mt-4 ring-1 ring-primary/60 text-primary font-semibold flex gap-2 items-center justify-center"
          onClick={() => setSettingsOpen(true)}
        >
          <span role="img" aria-label="settings">⚙️</span> {t("Settings")}
        </Button>
      </div>
      <SettingsSheet open={settingsOpen} setOpen={setSettingsOpen} />
    </div>
  );
};

export default Profile;
