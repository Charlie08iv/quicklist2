
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type SettingsSheetProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const languages = [
  { code: "en", label: "English" },
  { code: "sv", label: "Svenska" }
];

const SettingsSheet: React.FC<SettingsSheetProps> = ({ open, setOpen }) => {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-semibold">{t("Settings")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 pt-2">

          <section>
            <div className="flex items-center justify-between">
              <div className="font-medium">{t("Language")}</div>
              <div className="flex items-center gap-2">
                {languages.map(lang => (
                  <Button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    variant={locale === lang.code ? "default" : "outline"}
                    className="px-2 rounded-lg"
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center justify-between">
            <div className="font-medium">{t("Dark mode")}</div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={handleThemeToggle}
            />
          </section>

          <section>
            <Button
              asChild
              variant="link"
              className="text-blue-500 underline p-0"
              onClick={() => window.open("https://www.privacypolicygenerator.info/live.php?token=EXAMPLE", "_blank")}
            >
              {t("Privacy Policy")}
            </Button>
          </section>

          <section>
            <div className="flex flex-col gap-2">
              <span className="font-medium">{t("Feedback")}</span>
              <textarea
                className="w-full rounded-lg border-primary/20 min-h-[80px] p-2 resize-none text-sm"
                placeholder={t("Let us know your thoughts...")}
                rows={4}
                disabled
              />
              <Button className="w-full" disabled>
                {t("Send Feedback")}
              </Button>
              <span className="text-xs text-muted-foreground">(In-app feedback coming soon!)</span>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsSheet;
