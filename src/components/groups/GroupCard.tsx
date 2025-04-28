
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, Trash2 } from "lucide-react";
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

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    created_at: string;
    created_by: string;
    invite_code: string;
  };
}

export function GroupCard({ group }: GroupCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCreator, setIsCreator] = useState(user?.id === group.created_by);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(group.invite_code);
    toast.success(t("inviteCodeCopied"));
  };

  const handleDeleteGroup = async () => {
    if (!user || !isCreator) return;
    
    setIsDeleting(true);
    try {
      // Since the groups table was deleted, we'll just simulate success
      // but inform the user that this feature is currently under maintenance
      
      // Wait a moment to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.info(t("featureUnderMaintenance"));
      setDeleteDialogOpen(false);
      
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("errorOccurred"));
    } finally {
      setIsDeleting(false);
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
              aria-label={t("manageGroup")}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
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
        </CardContent>
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
    </>
  );
}
