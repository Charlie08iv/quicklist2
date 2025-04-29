
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { joinGroup } from "@/services/groups";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupJoined?: () => void;
}

export function JoinGroupDialog({ open, onOpenChange, onGroupJoined }: JoinGroupDialogProps) {
  const { t } = useTranslation();
  const { user, isLoggedIn, refreshSession } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setInviteCode("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify user is logged in before proceeding
    if (!isLoggedIn) {
      // Try refreshing the session first
      await refreshSession();
      
      // Check again after refresh
      if (!isLoggedIn) {
        toast.error(t("mustBeLoggedIn"));
        onOpenChange(false); // Close dialog
        return;
      }
    }
    
    if (!inviteCode.trim()) {
      toast.error(t("inviteCodeRequired"));
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Joining group with invite code:', inviteCode);
      // Call the joinGroup function with the invite code
      const group = await joinGroup(inviteCode);
      
      console.log('Group joined:', group);
      toast.success(t("groupJoined"));
      onOpenChange(false);
      setInviteCode("");
      if (onGroupJoined) onGroupJoined();
      
    } catch (error: any) {
      console.error("Error joining group:", error);
      
      // Check for session errors specifically
      if (error.message?.includes('No user ID found') || error.message?.includes('session')) {
        await refreshSession();
        toast.error(t("sessionRefreshRequired"));
      } else {
        toast.error(error.message || t("errorOccurred"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("joinGroup")}</DialogTitle>
          <DialogDescription>
            {t("enterInviteCodeToJoin")}
          </DialogDescription>
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
