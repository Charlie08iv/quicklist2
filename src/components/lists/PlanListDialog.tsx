
import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { planShoppingList } from "@/services/listService";
import { useToast } from "@/hooks/use-toast";

interface PlanListDialogProps {
  listId: string;
  currentDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onListUpdated: () => void;
}

export default function PlanListDialog({
  listId,
  currentDate,
  isOpen,
  onClose,
  onListUpdated
}: PlanListDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Convert the current date string to a Date object, or use today's date as default
  const initialDate = currentDate ? new Date(currentDate) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Format date as ISO string (YYYY-MM-DD)
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const success = await planShoppingList(listId, formattedDate);
      
      if (success) {
        toast({
          title: t("List scheduled"),
          description: t("Your list has been scheduled successfully"),
        });
        onListUpdated();
        onClose();
      } else {
        throw new Error("Failed to schedule list");
      }
    } catch (error) {
      console.error("Failed to schedule list:", error);
      toast({
        title: t("Error"),
        description: t("Failed to schedule list. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) onClose();
    }}>
      <DialogContent onPointerDownOutside={(e) => {
        if (isSubmitting) e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle>{t("Plan this list")}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t("Select a date for this shopping list")}
          </p>
          
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border p-3 pointer-events-auto"
              initialFocus
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>
              {t("Selected date")}: <strong>{format(selectedDate, "PPP")}</strong>
            </span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t("Cancel")}
          </Button>
          <Button 
            onClick={handleSave}
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
      </DialogContent>
    </Dialog>
  );
}
