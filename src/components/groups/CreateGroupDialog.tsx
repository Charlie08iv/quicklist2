
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("notLoggedIn"));
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Creating group with name:", groupName);
      console.log("User ID:", user.id);
      
      // Generate a unique invite code (use UUID for uniqueness)
      const inviteCode = crypto.randomUUID();
      
      // First, create the group with the current user as creator
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert([{ 
          name: groupName, 
          created_by: user.id,
          invite_code: inviteCode
        }])
        .select()
        .single();

      if (groupError) {
        console.error("Error creating group:", groupError);
        throw groupError;
      }
      
      if (!groupData) {
        throw new Error("Failed to create group: No data returned");
      }

      console.log("Group created successfully:", groupData);
      
      // Then, add the creator as a member of the group
      const { error: memberError } = await supabase
        .from("group_members")
        .insert([{ 
          group_id: groupData.id, 
          user_id: user.id 
        }]);

      if (memberError) {
        console.error("Error adding user as member:", memberError);
        throw memberError;
      }

      toast.success(t("groupCreated"));
      onOpenChange(false);
      setGroupName("");
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
          <DialogDescription>{t("enterGroupDetails")}</DialogDescription>
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
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !groupName.trim() || !user}>
              {isLoading ? t("creating") : t("createGroup")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
