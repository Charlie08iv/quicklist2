
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Share, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { RecipeDetails as RecipeDetailsType } from "@/types/recipes";

interface RecipeDetailsDialogProps {
  recipe: RecipeDetailsType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RecipeDetailsDialog: React.FC<RecipeDetailsDialogProps> = ({
  recipe,
  open,
  onOpenChange
}) => {
  const { t } = useTranslation();
  
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-0">
          <div className="relative w-full h-64 overflow-hidden">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-3xl font-semibold text-white">{recipe.title}</h2>
              <p className="text-white/90 mt-1">By {recipe.author}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 bg-black/30 rounded-full p-1 hover:bg-black/50 transition-colors text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              {t("share")}
            </Button>
          </div>

          <div>
            <DialogDescription className="mb-4">{recipe.description}</DialogDescription>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">{tag}</Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">{t("prepTime")}</span>
                <span className="font-medium">{recipe.prepTime} {t("min")}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">{t("cookTime")}</span>
                <span className="font-medium">{recipe.cookTime} {t("min")}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-xl mb-1">👥</span>
                <span className="text-sm text-muted-foreground">{t("servings")}</span>
                <span className="font-medium">{recipe.servings}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-xl font-semibold mb-4">{t("ingredients")}</h3>
            <ul className="space-y-2 mb-6">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-start gap-2">
                  <span className="h-6 w-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5">•</span>
                  <span>
                    <strong>{ingredient.quantity} {ingredient.unit}</strong> {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-xl font-semibold mb-4">{t("instructions")}</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction) => (
                <li key={instruction.id} className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                    {instruction.step}
                  </div>
                  <p>{instruction.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailsDialog;
