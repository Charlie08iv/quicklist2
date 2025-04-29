
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { joinGroup } from "@/services/groups";
import { supabase } from "@/integrations/supabase/client";

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
  const [sessionVerified, setSessionVerified] = useState(false);
  
  // Reset form when dialog opens and verify session
  useEffect(() => {
    if (open) {
      setInviteCode("");
      setSessionVerified(false);
      
      // Verify session when dialog opens
      const verifySession = async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            console.log("No active session detected in dialog");
            setSessionVerified(false);
            if (isLoggedIn) {
              // Auth hook thinks we're logged in but Supabase disagrees
              await refreshSession();
            }
          } else {
            console.log("Active session verified in dialog");
            setSessionVerified(true);
          }
        } catch (e) {
          console.error("Error verifying session:", e);
        }
      };
      
      verifySession();
    }
  }, [open, isLoggedIn, refreshSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify user is logged in before proceeding
    if (!isLoggedIn || !user) {
      console.log("Not logged in, refreshing session before proceeding");
      await refreshSession();
      
      const { data } = await supabase.auth.getSession();
      // Check again after refresh
      if (!data.session) {
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
      if (error.message?.includes('No user ID found') || 
          error.message?.includes('session') || 
          error.message?.includes('logged in')) {
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
          <Button 
            type="submit" 
            disabled={isLoading || !inviteCode.trim() || (!isLoggedIn && !sessionVerified)}
          >
            {isLoading ? t("joining") : t("joinGroup")}
          </Button>
          {!isLoggedIn && (
            <p className="text-sm text-red-500 mt-2">
              {t("mustBeLoggedIn")}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
