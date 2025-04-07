
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createShoppingList } from "@/services/listService";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface CreateListDialogProps {
  date?: Date;
  onListCreated: () => void;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({ date, onListCreated }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [isScheduled, setIsScheduled] = useState(Boolean(date));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createShoppingList({
        name: listName,
        date: isScheduled && date ? date.toISOString().split('T')[0] : undefined,
      });
      
      setListName("");
      setOpen(false);
      onListCreated();
    } catch (error) {
      console.error("Failed to create list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {t("createList")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("createNewList")}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">{t("listName")}</Label>
            <Input
              id="list-name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder={t("shoppingListName")}
              required
            />
          </div>
          
          {date && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="scheduled">{t("scheduleForDate")}</Label>
                <p className="text-sm text-muted-foreground">{date.toLocaleDateString()}</p>
              </div>
              <Switch
                id="scheduled"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {t("creating")}
              </>
            ) : (
              t("createList")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
