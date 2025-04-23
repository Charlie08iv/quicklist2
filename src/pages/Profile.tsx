
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Moon,
  Sun,
  Globe,
  User as UserIcon,
  List as ListIcon,
  Book as BookIcon,
  Settings as SettingsIcon,
  Mail as MailIcon,
  FileText as FileTextIcon
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FeedbackForm from "@/components/profile/FeedbackForm";

type ProfileTab = 'recipes' | 'lists' | 'settings';

const Profile: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const { user, signOut } = useAuth();

  const [tab, setTab] = React.useState<ProfileTab>('recipes');

  const handleLanguageChange = (value: string) => {
    setLanguage(value as any);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t("logout"),
      description: t("You have been successfully signed out."),
    });
  };

  return (
    <div className="space-y-6 pb-10 max-w-md mx-auto">
      {/* Profile header */}
      <div className="flex items-center gap-4 py-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>
            <UserIcon className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{user?.email?.split("@")[0] || 'User'}</h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-between rounded-lg bg-card p-1">
        <button
          onClick={() => setTab("recipes")}
          className={`flex-1 flex flex-col items-center gap-1 px-1 py-2 rounded-md 
            ${tab === "recipes" ? "bg-accent text-primary" : "hover:bg-muted"} transition`}
          aria-current={tab === "recipes"}
        >
          <BookIcon className="w-5 h-5" />
          <span className="text-xs">{t("recipes")}</span>
        </button>
        <button
          onClick={() => setTab("lists")}
          className={`flex-1 flex flex-col items-center gap-1 px-1 py-2 rounded-md 
            ${tab === "lists" ? "bg-accent text-primary" : "hover:bg-muted"} transition`}
          aria-current={tab === "lists"}
        >
          <ListIcon className="w-5 h-5" />
          <span className="text-xs">{t("lists")}</span>
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`flex-1 flex flex-col items-center gap-1 px-1 py-2 rounded-md 
            ${tab === "settings" ? "bg-accent text-primary" : "hover:bg-muted"} transition`}
          aria-current={tab === "settings"}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-xs">{t("settings")}</span>
        </button>
      </div>

      {/* Tab content */}
      <div>
        {tab === "recipes" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookIcon className="w-5 h-5" />
                {t("Saved Recipes")}
              </CardTitle>
              <CardDescription>
                {t("Your saved and liked recipes will show up here.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground text-sm py-4">
                {/* Placeholder: No saved recipes */}
                {t("You haven’t saved any recipes yet.")}
              </div>
            </CardContent>
          </Card>
        )}
        {tab === "lists" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListIcon className="w-5 h-5" />
                {t("Saved Lists")}
              </CardTitle>
              <CardDescription>
                {t("Your saved shopping lists will display here.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground text-sm py-4">
                {/* Placeholder: No saved lists */}
                {t("You haven’t saved any lists yet.")}
              </div>
            </CardContent>
          </Card>
        )}
        {tab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                {t("settings")}
              </CardTitle>
              <CardDescription>
                {t("Manage your account, appearance, and preferences.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dark/Light mode */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  <div>
                    <span className="font-medium">
                      {theme === "dark" ? t("darkMode") : t("lightMode")}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {theme === "dark"
                        ? t("Switch to light mode")
                        : t("Switch to dark mode")}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              <Separator />
              {/* Language */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <div>
                    <span className="font-medium">{t("language")}</span>
                    <div className="text-xs text-muted-foreground">
                      {t("Choose your preferred language")}
                    </div>
                  </div>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sv">Svenska</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              {/* Privacy Policy Link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" />
                  <span className="font-medium">Privacy Policy</span>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-primary p-0 h-auto"
                  onClick={() => window.open("https://yourdomain.com/privacy", "_blank")}
                  aria-label="Open Privacy Policy"
                >
                  View
                </Button>
              </div>
              <Separator />
              {/* Feedback Form */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MailIcon className="w-5 h-5" />
                  <span className="font-medium">Feedback</span>
                </div>
                <FeedbackForm />
              </div>
              <Separator />
              {/* Sign Out */}
              <Button
                variant="outline"
                className="w-full flex items-center mt-3"
                onClick={handleSignOut}
                type="button"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
