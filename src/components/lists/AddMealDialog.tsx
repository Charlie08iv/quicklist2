
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createMeal } from "@/services/listService";
import { MealType } from "@/types/lists";
import { Loader2, Plus, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface AddMealDialogProps {
  date: Date;
  onMealAdded: () => void;
}

const AddMealDialog: React.FC<AddMealDialogProps> = ({ date, onMealAdded }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createMeal({
        name: mealName,
        type: mealType,
        date: date.toISOString().split('T')[0],
      });
      
      setMealName("");
      setOpen(false);
      onMealAdded();
    } catch (error) {
      console.error("Failed to add meal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full group flex items-center gap-2 hover:bg-primary hover:text-primary-foreground">
          <Plus className="h-4 w-4 transition-transform group-hover:scale-125" />
          {t("addMeal")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            {t("addMealFor")} {date.toLocaleDateString()}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">{t("mealName")}</Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Enter meal name"
              className="border-primary/20 focus-visible:ring-primary"
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("mealType")}
            </Label>
            <RadioGroup 
              value={mealType} 
              onValueChange={(value) => setMealType(value as MealType)}
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/10 transition-all cursor-pointer">
                <RadioGroupItem value="breakfast" id="breakfast" />
                <Label htmlFor="breakfast" className="cursor-pointer">{t("breakfast")}</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/10 transition-all cursor-pointer">
                <RadioGroupItem value="lunch" id="lunch" />
                <Label htmlFor="lunch" className="cursor-pointer">{t("lunch")}</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/10 transition-all cursor-pointer">
                <RadioGroupItem value="dinner" id="dinner" />
                <Label htmlFor="dinner" className="cursor-pointer">{t("dinner")}</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {t("saving")}
              </>
            ) : (
              t("saveMeal")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMealDialog;
