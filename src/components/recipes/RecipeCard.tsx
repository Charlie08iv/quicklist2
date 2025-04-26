
import React from "react";
import { Card, CardImage } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeDetails } from "@/types/recipes";

interface RecipeCardProps {
  recipe: RecipeDetails;
  onLikeToggle?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLikeToggle }) => {
  return (
    <Card className="recipe-card group relative">
      <CardImage 
        src={recipe.image} 
        alt={recipe.title} 
        className="recipe-card-image"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">{recipe.title}</h3>
            <p className="text-sm text-muted-foreground">{recipe.description}</p>
          </div>
          {onLikeToggle && (
            <Button 
              variant="ghost" 
              size="icon"
              className="shrink-0"
              onClick={onLikeToggle}
            >
              <Heart 
                className={`h-5 w-5 ${recipe.liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
              />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{recipe.prepTime + recipe.cookTime} min</span>
          <span>•</span>
          <span className="capitalize">{recipe.category}</span>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;
