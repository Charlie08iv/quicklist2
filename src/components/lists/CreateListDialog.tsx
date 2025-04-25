
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createShoppingList } from "@/services/listService";
import { Loader2, Plus, Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateListDialogProps {
  date?: Date;
  onListCreated: () => void;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({ date: initialDate, onListCreated }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [isScheduled, setIsScheduled] = useState(Boolean(initialDate));
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  const formattedDate = date ? date.toLocaleDateString() : t("selectDate");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full group flex items-center gap-2 hover:bg-primary hover:text-primary-foreground">
          <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
          {t("createList")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">{t("createNewList")}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">{t("listName")}</Label>
            <Input
              id="list-name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder={t("shoppingListName")}
              className="border-primary/20 focus-visible:ring-primary"
              required
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-secondary/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="scheduled" className="font-medium">{t("scheduleForDate")}</Label>
                {isScheduled && (
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="mt-1 text-sm h-auto py-1 px-2 font-normal"
                      >
                        {formattedDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="p-2">
                        <input 
                          type="date" 
                          className="border rounded px-2 py-1"
                          value={date ? date.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : undefined;
                            setDate(newDate);
                            setCalendarOpen(false);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            <Switch
              id="scheduled"
              checked={isScheduled}
              onCheckedChange={(checked) => {
                setIsScheduled(checked);
                if (checked && !date) {
                  setDate(new Date());
                }
              }}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
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
