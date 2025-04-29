
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { createGroup } from "@/services/groupService";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setGroupName("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast.error(t("mustBeLoggedIn"));
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
      
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(t("errorOccurred"));
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
          <Button type="submit" disabled={isLoading || !groupName.trim()}>
            {isLoading ? t("creating") : t("createGroup")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
