
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { createGroup } from "@/services/groups";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const { user, isLoggedIn, refreshSession } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);
  
  // Group creation flow states
  const [step, setStep] = useState<"naming" | "sharing">("naming");
  const [createdGroup, setCreatedGroup] = useState<{id: string, name: string, invite_code: string} | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "link">("code");
  
  // Reset form and verify session when dialog opens
  useEffect(() => {
    if (open) {
      setGroupName("");
      setStep("naming");
      setCreatedGroup(null);
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

  const handleCreateGroup = async (e: React.FormEvent) => {
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
      
      // Move to sharing step
      setCreatedGroup(group);
      setStep("sharing");
      
      // Don't close the dialog yet, allow sharing first
      if (onGroupCreated) onGroupCreated();
      
    } catch (error: any) {
      console.error("Error creating group:", error);
      
      // Check for session errors specifically
      if (error.message?.includes('session') || error.message?.includes('logged in')) {
        await refreshSession();
        toast.error(t("sessionRefreshRequired"));
      } else {
        toast.error(error.message || t("errorOccurred"));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (createdGroup) {
      navigator.clipboard.writeText(createdGroup.invite_code);
      toast.success(t("copiedToClipboard"));
    }
  };
  
  const handleCopyLink = () => {
    if (createdGroup) {
      const baseUrl = window.location.origin;
      const joinLink = `${baseUrl}/groups/join?code=${createdGroup.invite_code}`;
      navigator.clipboard.writeText(joinLink);
      toast.success(t("copiedToClipboard"));
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "naming" ? t("createNewGroup") : t("inviteToGroup")}
          </DialogTitle>
          <DialogDescription>
            {step === "naming" 
              ? t("createGroupDescription")
              : t("shareGroupInvite")}
          </DialogDescription>
        </DialogHeader>
        
        {step === "naming" ? (
          <form onSubmit={handleCreateGroup} className="space-y-4">
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
            <Button 
              type="submit" 
              disabled={isLoading || !groupName.trim() || (!isLoggedIn && !sessionVerified)}
            >
              {isLoading ? t("creating") : t("createGroup")}
            </Button>
            {!isLoggedIn && (
              <p className="text-sm text-red-500 mt-2">
                {t("mustBeLoggedIn")}
              </p>
            )}
          </form>
        ) : createdGroup ? (
          <>
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">{t("groupCreatedSuccess")}</p>
                <h3 className="text-lg font-bold mt-1">{createdGroup.name}</h3>
              </div>
              
              <Tabs defaultValue="code" value={activeTab} onValueChange={(v) => setActiveTab(v as "code" | "link")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">
                    <Users className="mr-2 h-4 w-4" />
                    {t("inviteCode")}
                  </TabsTrigger>
                  <TabsTrigger value="link">
                    <Link className="mr-2 h-4 w-4" />
                    {t("inviteLink")}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="space-y-3">
                  <div className="mt-2">
                    <Label>{t("groupInviteCode")}</Label>
                    <div className="flex mt-1.5">
                      <Input 
                        value={createdGroup.invite_code} 
                        readOnly
                        className="font-mono text-center"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="ml-2"
                        onClick={handleCopyCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {t("shareCodeDescription")}
                  </p>
                </TabsContent>
                
                <TabsContent value="link" className="space-y-3">
                  <div className="mt-2">
                    <Label>{t("groupInviteLink")}</Label>
                    <div className="flex mt-1.5">
                      <Input 
                        value={`${window.location.origin}/groups/join?code=${createdGroup.invite_code}`} 
                        readOnly
                        className="text-xs"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="ml-2"
                        onClick={handleCopyLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {t("shareLinkDescription")}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter>
              <Button onClick={handleClose}>
                {t("done")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center p-4">
            {t("errorOccurred")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
