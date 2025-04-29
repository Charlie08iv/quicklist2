
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { joinGroup } from "@/services/groupService";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupJoined?: () => void;
}

export function JoinGroupDialog({ open, onOpenChange, onGroupJoined }: JoinGroupDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("pleaseSignIn"));
      return;
    }
    
    if (!inviteCode.trim()) {
      toast.error(t("pleaseEnterInviteCode"));
      return;
    }
    
    setIsLoading(true);
    try {
      // Fix: Pass only one argument to joinGroup
      const group = await joinGroup(inviteCode.trim());
      
      if (group) {
        toast.success(t("joinedGroup", { name: group.name }));
        onOpenChange(false);
        setInviteCode("");
        if (onGroupJoined) onGroupJoined();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("invalidInviteCode"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("joinGroup")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="inviteCode">{t("inviteCode")}</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t("enterInviteCode")}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading || !inviteCode.trim()}>
            {isLoading ? t("joining") : t("joinGroup")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
