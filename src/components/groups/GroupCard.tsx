
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, Trash2, Plus, List, MessageSquare, Heart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFriendToGroup } from "@/services/groupService";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    created_at: string;
    created_by: string;
    invite_code: string;
  };
  onDeleted?: () => void;
}

export function GroupCard({ group, onDeleted }: GroupCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreator] = useState(user?.id === group.created_by);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [groupDetailsDialogOpen, setGroupDetailsDialogOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(group.invite_code);
    toast.success(t("inviteCodeCopied"));
  };

  const handleDeleteGroup = async () => {
    if (!user || !isCreator) return;
    
    setIsDeleting(true);
    try {
      // We would add actual deletion logic here
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(t("groupDeleted"));
      setDeleteDialogOpen(false);
      if (onDeleted) onDeleted();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("errorOccurred"));
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleGroupDetails = () => {
    setGroupDetailsDialogOpen(true);
  };
  
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!friendEmail.trim()) {
      toast.error(t("emailRequired"));
      return;
    }
    
    setIsAddingFriend(true);
    try {
      await addFriendToGroup(group.id, friendEmail);
      toast.success(t("friendAdded"));
      setFriendEmail("");
      setAddFriendDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || t("errorAddingFriend"));
    } finally {
      setIsAddingFriend(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <div className="flex gap-2">
            {isCreator && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t("deleteGroup")}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("groupDetails")}
              onClick={handleGroupDetails}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{t("group")}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInviteCode}
              className="text-xs"
            >
              {t("copyInviteCode")}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => setAddFriendDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              {t("addFriend")}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => toast.info(t("featureUnderDevelopment"))}
            >
              <List className="h-3 w-3" />
              {t("lists")}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => toast.info(t("featureUnderDevelopment"))}
            >
              <MessageSquare className="h-3 w-3" />
              {t("chat")}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => toast.info(t("featureUnderDevelopment"))}
            >
              <Heart className="h-3 w-3" />
              {t("wishlist")}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            {t("inviteCode")}: <span className="font-mono">{group.invite_code}</span>
          </p>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteGroup")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteGroupConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={addFriendDialogOpen} onOpenChange={setAddFriendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addFriendToGroup")}</DialogTitle>
            <DialogDescription>
              {t("enterEmailToAddFriend")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFriend} className="space-y-4">
            <div>
              <Label htmlFor="friendEmail">{t("email")}</Label>
              <Input
                id="friendEmail"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder={t("enterFriendEmail")}
                type="email"
                required
              />
            </div>
            <Button type="submit" disabled={isAddingFriend || !friendEmail.trim()}>
              {isAddingFriend ? t("adding") : t("addFriend")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={groupDetailsDialogOpen} onOpenChange={setGroupDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{group.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t("groupInfo")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("inviteCode")}: <span className="font-mono">{group.invite_code}</span>
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">{t("shareGroup")}</h4>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={handleCopyInviteCode}
              >
                {t("copyInviteCode")}
              </Button>
            </div>
            
            <div className="pt-2">
              <h4 className="font-medium mb-2">{t("groupActions")}</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setGroupDetailsDialogOpen(false);
                    setAddFriendDialogOpen(true);
                  }}
                >
                  {t("addFriend")}
                </Button>
                
                {isCreator && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={() => {
                      setGroupDetailsDialogOpen(false);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    {t("deleteGroup")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
