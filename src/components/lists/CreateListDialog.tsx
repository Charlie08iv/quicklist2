import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShoppingList } from "@/services/listService";
import { Loader2, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingList } from "@/types/lists";
import ListItemManager from "./ListItemManager";

interface CreateListDialogProps {
  onListCreated: () => void;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({ onListCreated }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'name' | 'items'>('name');
  const [listName, setListName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdList, setCreatedList] = useState<ShoppingList | null>(null);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newList = await createShoppingList({
        name: listName.trim(),
      });
      setCreatedList(newList as ShoppingList);
      setStep('items');
    } catch (error) {
      console.error("Failed to create list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep('name');
    setListName("");
    setCreatedList(null);
    onListCreated();
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose();
      } else {
        setOpen(true);
      }
    }}>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-primary flex items-center gap-2"
      >
        <Plus className="h-5 w-5" />
        {t("New List")}
      </Button>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === 'name' ? t("Create New List") : createdList?.name}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'name' ? (
          <form onSubmit={handleCreateList} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">{t("List Name")}</Label>
              <Input
                id="list-name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={t("Enter list name")}
                className="border-primary/20"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    {t("Creating")}
                  </>
                ) : (
                  t("Continue")
                )}
              </Button>
            </div>
          </form>
        ) : createdList && (
          <div className="space-y-4">
            <ListItemManager 
              items={[]}
              onAddItem={async (item) => {
                // This will be handled by ListItemManager's onAddItem prop
                // The list will be refreshed through onListCreated
              }}
            />
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                {t("Done")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
