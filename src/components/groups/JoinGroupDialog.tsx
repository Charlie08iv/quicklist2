
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { joinGroup } from "@/services/groups";
import { verifyAuth } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
  const [verifyingAuth, setVerifyingAuth] = useState(false);
  
  // Reset form when dialog opens and verify session
  useEffect(() => {
    if (open) {
      setInviteCode("");
      setSessionVerified(false);
      setVerifyingAuth(true);
      
      // Verify session when dialog opens
      const verifySession = async () => {
        try {
          console.log("JoinGroupDialog: Verifying session...");
          const { isAuthenticated } = await verifyAuth();
          
          setSessionVerified(isAuthenticated);
          console.log("JoinGroupDialog: Session verified -", isAuthenticated);
          
          if (!isAuthenticated && isLoggedIn) {
            console.log("Session verification failed but isLoggedIn is true, refreshing session");
            await refreshSession();
            
            // Check again after refresh
            const { isAuthenticated: refreshedAuth } = await verifyAuth();
            setSessionVerified(refreshedAuth);
          }
        } catch (e) {
          console.error("Error verifying session in JoinGroupDialog:", e);
        } finally {
          setVerifyingAuth(false);
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
      setVerifyingAuth(true);
      
      try {
        await refreshSession();
        
        const { isAuthenticated, userId } = await verifyAuth();
        setSessionVerified(isAuthenticated);
        
        // Check again after refresh
        if (!isAuthenticated || !userId) {
          toast.error(t("mustBeLoggedIn"));
          onOpenChange(false); // Close dialog
          return;
        }
      } catch (e) {
        console.error("Error refreshing session:", e);
        toast.error(t("sessionRefreshError"));
        return;
      } finally {
        setVerifyingAuth(false);
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
        
        {verifyingAuth ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Verifying authentication...</p>
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
            <Button 
              type="submit" 
              disabled={isLoading || !inviteCode.trim() || (!isLoggedIn && !sessionVerified)}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("joining")}
                </span>
              ) : t("joinGroup")}
            </Button>
            {!isLoggedIn && !sessionVerified && (
              <p className="text-sm text-red-500 mt-2">
                {t("mustBeLoggedIn")}
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
