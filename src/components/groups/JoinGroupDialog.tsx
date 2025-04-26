
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinGroupDialog({ open, onOpenChange }: JoinGroupDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("notLoggedIn"));
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Joining group with invite code:", inviteCode);
      console.log("Current user:", user.id);
      
      // First, find the group with the invite code
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

      if (groupError) {
        if (groupError.code === 'PGRST116') {
          toast.error(t("invalidInviteCode"));
        } else {
          console.error("Error finding group:", groupError);
          toast.error(t("errorJoiningGroup"));
        }
        setIsLoading(false);
        return;
      }

      if (!group) {
        toast.error(t("invalidInviteCode"));
        setIsLoading(false);
        return;
      }

      console.log("Found group:", group);

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (memberCheckError) {
        console.error("Error checking membership:", memberCheckError);
        toast.error(t("errorJoiningGroup"));
        setIsLoading(false);
        return;
      }
      
      if (existingMember) {
        toast.info(t("alreadyGroupMember"));
        onOpenChange(false);
        setInviteCode("");
        setIsLoading(false);
        return;
      }

      console.log("Adding user to group:", { group_id: group.id, user_id: user.id });

      // Then, add the user as a member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert([{ group_id: group.id, user_id: user.id }]);

      if (memberError) {
        console.error("Error joining group:", memberError);
        toast.error(t("errorJoiningGroup"));
        setIsLoading(false);
        return;
      }

      console.log("Successfully joined group");
      toast.success(t("joinedGroup"));
      onOpenChange(false);
      setInviteCode("");
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error(t("errorJoiningGroup"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("joinGroup")}</DialogTitle>
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
          <Button type="submit" disabled={isLoading || !inviteCode.trim()}>
            {isLoading ? t("joining") : t("joinGroup")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
