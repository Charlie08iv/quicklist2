import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { createGroup } from "@/services/groupService";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const { user, isLoggedIn, initialized } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  
  // Reset form and check auth when dialog opens
  useEffect(() => {
    if (open) {
      setGroupName("");
      
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
    
    if (!groupName.trim()) {
      toast.error(t("groupNameRequired"));
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Creating group with name:', groupName);
      // Call the createGroup function with the group name
      const group = await createGroup(groupName);
      
      console.log('Group created:', group);
      toast.success(t("groupCreated"));
      onOpenChange(false);
      setGroupName("");
      if (onGroupCreated) onGroupCreated();
      
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNewGroup")}</DialogTitle>
          <DialogDescription>
            {t("createGroupDescription")}
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
              <Label htmlFor="groupName">{t("groupName")}</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t("enterGroupName")}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || !groupName.trim() || checkingAuth}>
              {isLoading ? t("creating") : t("createGroup")}
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
