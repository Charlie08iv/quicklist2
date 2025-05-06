
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MoreHorizontal, 
  Edit, 
  Share, 
  Archive, 
  Loader2,
  Trash2,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingList } from "@/types/lists";
import { renameShoppingList, archiveShoppingList, deleteShoppingList } from "@/services/listService";
import ShareOptions from "./ShareOptionsDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PlanListDialog from "./PlanListDialog";

interface ListActionsMenuProps {
  list: ShoppingList;
  onListUpdated: () => void;
}

const ListActionsMenu: React.FC<ListActionsMenuProps> = ({ list, onListUpdated }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPlanListOpen, setIsPlanListOpen] = useState(false);
  const [newName, setNewName] = useState(list.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRename = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (newName.trim() === "" || newName === list.name) {
      setIsRenameOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await renameShoppingList(list.id, newName);
      toast({
        title: "List renamed",
        description: `Your list has been renamed to "${newName}"`,
      });
      setIsRenameOpen(false);
      setTimeout(() => {
        onListUpdated();
      }, 100);
    } catch (error) {
      console.error("Failed to rename list:", error);
      toast({
        title: "Failed to rename list",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSubmitting(true);
    setMenuOpen(false);
    
    try {
      const success = await archiveShoppingList(list.id);
      if (success) {
        toast({
          title: "List archived",
          description: "Your list has been moved to archives",
        });
        // Force a refresh of the lists by waiting a moment before triggering onListUpdated
        setTimeout(() => {
          onListUpdated();
        }, 100);
      } else {
        throw new Error("Failed to archive list");
      }
    } catch (error) {
      console.error("Failed to archive list:", error);
      toast({
        title: "Failed to archive list",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsSubmitting(true);
    
    try {
      await deleteShoppingList(list.id);
      toast({
        title: "List deleted",
        description: "Your list has been permanently deleted",
      });
      setIsDeleteConfirmOpen(false);
      
      // Navigate back to lists page after a short delay to allow state update
      setTimeout(() => {
        navigate('/lists');
        onListUpdated();
      }, 100);
    } catch (error) {
      console.error("Failed to delete list:", error);
      toast({
        title: "Failed to delete list",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMenuItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePlanList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    setIsPlanListOpen(true);
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(true);
        }}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={handleMenuItemClick}>
          <DropdownMenuItem onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(false);
            setNewName(list.name);
            setIsRenameOpen(true);
          }}>
            <Edit className="mr-2 h-4 w-4" />
            {t("Rename")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(false);
            setIsSharing(true);
          }}>
            <Share className="mr-2 h-4 w-4" />
            {t("Share")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePlanList}>
            <Calendar className="mr-2 h-4 w-4" />
            {list.date ? t("Change date") : t("Plan this list")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            {t("Archive")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(false);
            setIsDeleteConfirmOpen(true);
          }} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={(open) => {
        if (!isSubmitting) setIsRenameOpen(open);
        if (open) setNewName(list.name);
      }}>
        <DialogContent 
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => {
            if (isSubmitting) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("Rename List")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">{t("New Name")}</Label>
              <Input
                id="list-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-primary/20"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRenameOpen(false);
                }} 
                type="button"
                disabled={isSubmitting}
              >
                {t("Cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Saving")}
                  </>
                ) : (
                  t("Save")
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={(open) => {
        if (!isSubmitting) setIsDeleteConfirmOpen(open);
      }}>
        <DialogContent 
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => {
            if (isSubmitting) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              {t("Delete List")}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {t("Are you sure you want to delete this list? This action cannot be undone.")}
          </DialogDescription>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteConfirmOpen(false);
              }}
              disabled={isSubmitting}
            >
              {t("Cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => handleDelete(e)} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Deleting")}
                </>
              ) : (
                t("Delete")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Plan List Dialog */}
      {isPlanListOpen && (
        <PlanListDialog
          listId={list.id}
          currentDate={list.date}
          isOpen={isPlanListOpen}
          onClose={() => setIsPlanListOpen(false)}
          onListUpdated={onListUpdated}
        />
      )}
      
      {/* Share functionality */}
      {isSharing && (
        <ShareOptions 
          listId={list.id} 
          onComplete={() => {
            setIsSharing(false);
            onListUpdated();
          }} 
        />
      )}
    </>
  );
};

export default ListActionsMenu;
