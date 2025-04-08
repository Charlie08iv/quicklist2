
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Heart, Share, ShoppingCart, X, Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { RecipeDetails as RecipeDetailsType } from "@/types/recipes";
import { useState } from "react";
import { addRecipeToShoppingList } from "@/services/recipeService";
import { useToast } from "@/hooks/use-toast";

interface RecipeDetailsDialogProps {
  recipe: RecipeDetailsType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike?: () => void;
}

const RecipeDetailsDialog: React.FC<RecipeDetailsDialogProps> = ({
  recipe,
  open,
  onOpenChange,
  onLike
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  if (!recipe) return null;
  
  const handleAddToList = async () => {
    setIsAdding(true);
    try {
      const success = await addRecipeToShoppingList(recipe.id);
      
      if (success) {
        toast({
          title: t("ingredientsAdded"),
          description: t("ingredientsAddedToList"),
        });
      }
    } catch (error) {
      console.error("Failed to add ingredients to list:", error);
    } finally {
      setIsAdding(false);
    }
  };

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
            <DialogClose className="absolute top-4 right-4 bg-black/30 rounded-full p-1 hover:bg-black/50 transition-colors">
              <X className="h-6 w-6 text-white" />
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={onLike} 
                variant="outline"
                className={recipe.liked ? "text-red-500" : ""}
              >
                <Heart className="h-4 w-4 mr-2" fill={recipe.liked ? "currentColor" : "none"} />
                <span>{recipe.liked ? t("liked") : t("like")}</span>
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                {t("share")}
              </Button>
            </div>
            
            <Button onClick={handleAddToList} disabled={isAdding}>
              {isAdding ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                  {t("adding")}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t("addToList")}
                </>
              )}
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
