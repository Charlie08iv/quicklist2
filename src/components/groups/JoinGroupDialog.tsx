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
import { Loader2 } from "lucide-react";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupJoined?: () => void;
}

export function JoinGroupDialog({ open, onOpenChange, onGroupJoined }: JoinGroupDialogProps) {
  const { t } = useTranslation();
  const { user, isLoggedIn, initialized } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  
  // Reset form and check auth when dialog opens
  useEffect(() => {
    if (open) {
      setInviteCode("");
      
      // Check auth status when dialog opens
      if (initialized) {
        setCheckingAuth(false);
        if (!isLoggedIn) {
          toast.error(t("mustBeLoggedIn"));
          navigate("/auth");
          onOpenChange(false);
        }
      } else {
        // Keep checking auth status
        const checkInterval = setInterval(() => {
          if (initialized) {
            clearInterval(checkInterval);
            setCheckingAuth(false);
            if (!isLoggedIn) {
              toast.error(t("mustBeLoggedIn"));
              navigate("/auth");
              onOpenChange(false);
            }
          }
        }, 500);
        
        return () => clearInterval(checkInterval);
      }
    }
  }, [open, isLoggedIn, initialized, onOpenChange, t, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !user) {
      toast.error(t("mustBeLoggedIn"));
      navigate("/auth");
      onOpenChange(false);
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
        
        {checkingAuth ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">{t("checkingAuthentication")}</span>
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
            <Button type="submit" disabled={isLoading || !inviteCode.trim() || checkingAuth}>
              {isLoading ? t("joining") : t("joinGroup")}
            </Button>
            
            {/* Auth debug info */}
            <details className="text-xs text-muted-foreground">
              <summary>Debug Info</summary>
              <div className="pt-1">
                <p>Auth Ready: {initialized ? "Yes" : "No"}</p>
                <p>Logged In: {isLoggedIn ? "Yes" : "No"}</p>
                <p>User ID: {user?.id || "None"}</p>
              </div>
            </details>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
