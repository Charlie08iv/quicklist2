import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Share, ShoppingCart, Users } from "lucide-react";
import { RecipeDetails } from "@/types/recipes";
import { useTranslation } from "@/hooks/use-translation";

interface RecipeDetailsDialogProps {
  recipe: RecipeDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToList?: () => void;
}

const RecipeDetailsDialog: React.FC<RecipeDetailsDialogProps> = ({
  recipe,
  open,
  onOpenChange,
  onAddToList,
}) => {
  const { t } = useTranslation();
  
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative w-full h-64">
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-semibold text-white mb-2">{recipe.title}</h2>
            <p className="text-white/90">By {recipe.author}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              {t("share")}
            </Button>
            <Button onClick={onAddToList}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("addToList")}
            </Button>
          </div>

          <p className="text-muted-foreground mb-6">{recipe.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">{t("prepTime")}</span>
              <span className="font-medium">{recipe.prepTime} {t("min")}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">{t("cookTime")}</span>
              <span className="font-medium">{recipe.cookTime} {t("min")}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">{t("servings")}</span>
              <span className="font-medium">{recipe.servings}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">{t("ingredients")}</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/50" />
                    <span>
                      <strong>{ingredient.quantity} {ingredient.unit}</strong> {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">{t("instructions")}</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction) => (
                  <li key={instruction.id} className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {instruction.step}
                    </div>
                    <p className="pt-1">{instruction.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailsDialog;
