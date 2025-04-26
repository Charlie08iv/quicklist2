import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Mail, User as UserIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  theme: string;
  onThemeChange: (theme: "light" | "dark") => void;
};

const LANGS = [
  { value: "en", label: "English" },
  { value: "sv", label: "Svenska" },
];

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  email,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
}) => {
  const [notifications, setNotifications] = useState(true);
  const [openLastUsed, setOpenLastUsed] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(false);
  const [rating, setRating] = useState(0);

  // Star rating
  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-muted-foreground"}`}
          onClick={() => setRating(star)}
          type="button"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 rounded-2xl bg-background max-w-md w-full">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex flex-col items-center">
            <UserIcon className="mb-1 h-10 w-10 text-muted-foreground" />
            <span className="text-lg font-semibold mt-1">{email}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <div>
            <span className="font-semibold text-muted-foreground mb-1 block">General</span>
            <div className="flex flex-col gap-4 rounded-xl">
              {/* Language Picker */}
              <div className="flex items-center justify-between">
                <label htmlFor="language" className="font-medium">Language</label>
                <select
                  id="language"
                  className="rounded border bg-muted px-2 py-1 text-sm outline-none"
                  value={language}
                  onChange={e => onLanguageChange(e.target.value)}
                >
                  {LANGS.map(opt => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* Light/Dark mode */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Light mode</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Switch to {theme === "dark" ? "light" : "dark"} mode</span>
                  <Switch
                    checked={theme === "light"}
                    onCheckedChange={checked => onThemeChange(checked ? "light" : "dark")}
                  />
                </div>
              </div>
              {/* Notification */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Notification</label>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              {/* Open last used list */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Open last used list</label>
                <Switch checked={openLastUsed} onCheckedChange={setOpenLastUsed} />
              </div>
              {/* Keep screen on */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Keep the screen on</label>
                <Switch checked={keepScreenOn} onCheckedChange={setKeepScreenOn} />
              </div>
              {/* Rate the app */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Rate the app!</label>
                <StarRating />
              </div>
              {/* Feedback */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Report a problem/feedback</label>
                <Button size="sm" variant="outline" className="flex gap-1 items-center w-fit">
                  <Mail className="w-4 h-4" />
                  Send Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
