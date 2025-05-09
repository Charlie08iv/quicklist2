
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeDetails } from "@/types/recipes";

interface RecipeCardProps {
  recipe: RecipeDetails;
  onOpenDetails: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onOpenDetails }) => {
  return (
    <Card className="recipe-card group relative overflow-hidden">
      <div className="relative">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="aspect-video w-full object-cover"
        />
        <Badge 
          variant="secondary" 
          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/60"
        >
          {recipe.category}
        </Badge>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h3 className="font-medium text-xl mb-2">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground">{recipe.description}</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>{recipe.prepTime + recipe.cookTime} min</span>
        </div>

        <div className="flex items-center justify-between">
          <Button 
            variant="default" 
            onClick={onOpenDetails}
            className="flex-1"
          >
            View Recipe
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;
