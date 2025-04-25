import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MoreHorizontal, 
  Edit, 
  Share, 
  Archive, 
  Calendar, 
  Loader2,
  Trash2
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingList } from "@/types/lists";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  renameShoppingList, 
  archiveShoppingList, 
  planShoppingList,
  deleteShoppingList
} from "@/services/listService";
import ShareOptionsDialog from "./ShareOptionsDialog";

interface ListActionsMenuProps {
  list: ShoppingList;
  onListUpdated: () => void;
}

const ListActionsMenu: React.FC<ListActionsMenuProps> = ({ list, onListUpdated }) => {
  const { t } = useTranslation();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(list.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleRename = async () => {
    if (newName.trim() === "" || newName === list.name) {
      setIsRenameOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await renameShoppingList(list.id, newName);
      onListUpdated();
      setIsRenameOpen(false);
    } catch (error) {
      console.error("Failed to rename list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveShoppingList(list.id);
      onListUpdated();
    } catch (error) {
      console.error("Failed to archive list:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteShoppingList(list.id);
      onListUpdated();
    } catch (error) {
      console.error("Failed to delete list:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("Rename")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
            <Share className="mr-2 h-4 w-4" />
            {t("Share")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            {t("Archive")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Rename List")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">{t("New Name")}</Label>
              <Input
                id="list-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-primary/20"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={handleRename} disabled={isSubmitting}>
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
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      {showShareDialog && (
        <ShareOptionsDialog listId={list.id} />
      )}
    </>
  );
};

export default ListActionsMenu;
