
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { joinGroup } from "@/services/groupService";
import { useNavigate } from "react-router-dom";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupJoined?: () => void;
}

export function JoinGroupDialog({ open, onOpenChange, onGroupJoined }: JoinGroupDialogProps) {
  const { t } = useTranslation();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setInviteCode("");
    }
  }, [open]);

  const handleLoginRedirect = () => {
    // Close dialog and redirect to login
    onOpenChange(false);
    navigate("/auth", { state: { returnTo: "/groups" } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authLoading) {
      // Wait for auth check to complete
      return;
    }
    
    if (!isLoggedIn) {
      toast.error(t("mustBeLoggedIn"));
      handleLoginRedirect();
      return;
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
      toast.error(error.message || t("errorOccurred"));
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
        
        {authLoading ? (
          <div className="text-center py-4">
            <p>{t("loading")}</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="space-y-4">
            <p className="text-center">{t("loginToJoinGroup")}</p>
            <div className="flex justify-center">
              <Button onClick={handleLoginRedirect}>
                {t("login")}
              </Button>
            </div>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
