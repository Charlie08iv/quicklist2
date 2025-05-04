
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { createGroup } from "@/services/groupService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Use GroupData interface defined in groupService
import type { Group } from "@/services/groupService";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Group creation flow states
  const [step, setStep] = useState<"naming" | "sharing">("naming");
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "link">("code");
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setGroupName("");
      setStep("naming");
      setCreatedGroup(null);
    }
  }, [open]);

  const handleLoginRedirect = () => {
    // Close dialog and redirect to login
    onOpenChange(false);
    navigate("/auth", { state: { returnTo: "/groups" } });
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authLoading) {
      // Wait for auth check to complete
      return;
    }
    
    if (!isLoggedIn) {
      toast.error(t("mustBeLoggedIn"));
      handleLoginRedirect();
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
      
      if (!group) {
        throw new Error("Failed to create group");
      }
      
      console.log('Group created:', group);
      toast.success(t("groupCreated"));
      
      // Move to sharing step
      setCreatedGroup(group);
      setStep("sharing");
      
      // Don't close the dialog yet, allow sharing first
      if (onGroupCreated) onGroupCreated();
      
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || t("errorOccurred"));
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
        
        {authLoading ? (
          <div className="text-center py-4">
            <p>{t("loading")}</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="space-y-4">
            <p className="text-center">{t("loginToCreateGroup")}</p>
            <div className="flex justify-center">
              <Button onClick={handleLoginRedirect}>
                {t("login")}
              </Button>
            </div>
          </div>
        ) : step === "naming" ? (
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
            <Button type="submit" disabled={isLoading || !groupName.trim()}>
              {isLoading ? t("creating") : t("createGroup")}
            </Button>
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
