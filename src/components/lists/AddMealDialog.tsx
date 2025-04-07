
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createMeal } from "@/services/listService";
import { MealType } from "@/types/lists";
import { Loader2 } from "lucide-react";
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
        <Button variant="outline" className="w-full">
          {t("addMeal")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addMealFor")} {date.toLocaleDateString()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">{t("mealName")}</Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Enter meal name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t("mealType")}</Label>
            <RadioGroup 
              value={mealType} 
              onValueChange={(value) => setMealType(value as MealType)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breakfast" id="breakfast" />
                <Label htmlFor="breakfast">{t("breakfast")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lunch" id="lunch" />
                <Label htmlFor="lunch">{t("lunch")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dinner" id="dinner" />
                <Label htmlFor="dinner">{t("dinner")}</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
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
