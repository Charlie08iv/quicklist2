
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { createShoppingList } from "@/services/listService";
import { toast } from "sonner";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onListCreated: () => void;
  selectedDate?: Date;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({
  open,
  onOpenChange,
  onListCreated,
  selectedDate
}) => {
  const { t } = useTranslation();
  const [listName, setListName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listName.trim()) {
      toast.error(t("Please enter a list name"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createShoppingList({
        name: listName,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
      });
      setListName("");
      onListCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error(t("Failed to create list"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("Create New List")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="list-name">{t("List Name")}</Label>
            <Input
              id="list-name"
              autoFocus
              placeholder={t("Enter list name")}
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !listName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Creating...")}
                </>
              ) : (
                t("Save")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
