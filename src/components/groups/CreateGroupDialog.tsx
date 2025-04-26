
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    if (!user) {
      toast.error(t("You need to be logged in to create a group"));
      return;
    }
    
    if (!groupName.trim()) {
      toast.error(t("Please enter a group name"));
      return;
    }
    
    setIsLoading(true);
    try {
      // Insert the group into the database
      const { data, error } = await supabase
        .from("groups")
        .insert([{ 
          name: groupName.trim(), 
          created_by: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a member of the group
      if (data) {
        const { error: memberError } = await supabase
          .from("group_members")
          .insert([{ 
            group_id: data.id, 
            user_id: user.id 
          }]);
        
        if (memberError) throw memberError;
      }

      toast.success(t("Group created successfully"));
      onOpenChange(false);
      setGroupName("");
      if (onGroupCreated) onGroupCreated();
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || t("Error creating group"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Create New Group")}</DialogTitle>
          <DialogDescription>{t("Create a group to share lists and chat with others.")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="groupName">{t("Group Name")}</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t("Enter group name")}
              required
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isLoading || !groupName.trim()} className="w-full">
            {isLoading ? t("Creating...") : t("Create Group")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
