
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupJoined?: () => void;
}

export function JoinGroupDialog({ open, onOpenChange, onGroupJoined }: JoinGroupDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("You need to be logged in to join a group"));
      return;
    }
    
    if (!inviteCode.trim()) {
      toast.error(t("Please enter an invite code"));
      return;
    }
    
    setIsLoading(true);
    try {
      // Find the group with the invite code
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("invite_code", inviteCode.trim())
        .single();

      if (groupError) {
        if (groupError.code === 'PGRST116') {
          toast.error(t("Invalid invite code"));
        } else {
          throw groupError;
        }
        setIsLoading(false);
        return;
      }

      // Check if the user is already a member of the group
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();
        
      if (!memberCheckError && existingMember) {
        toast.info(t("You are already a member of this group"));
        onOpenChange(false);
        setInviteCode("");
        if (onGroupJoined) onGroupJoined();
        setIsLoading(false);
        return;
      }

      // Add the user as a member of the group
      const { error: memberError } = await supabase
        .from("group_members")
        .insert([{ 
          group_id: group.id, 
          user_id: user.id 
        }]);

      if (memberError) throw memberError;

      toast.success(t("Successfully joined the group"));
      onOpenChange(false);
      setInviteCode("");
      if (onGroupJoined) onGroupJoined();
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast.error(error.message || t("Error joining group"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Join Group")}</DialogTitle>
          <DialogDescription>{t("Enter the invite code to join an existing group.")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="inviteCode">{t("Invite Code")}</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t("Enter invite code")}
              required
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isLoading || !inviteCode.trim()} className="w-full">
            {isLoading ? t("Joining...") : t("Join Group")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
