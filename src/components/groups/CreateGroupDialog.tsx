
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("groups")
        .insert([{ name: groupName, created_by: user.id }]);

      if (error) throw error;

      toast.success(t("groupCreated"));
      onOpenChange(false);
      setGroupName("");
      
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(t("errorCreatingGroup"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNewGroup")}</DialogTitle>
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
