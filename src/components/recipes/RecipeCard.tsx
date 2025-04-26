
import React from "react";
import { Card } from "@/components/ui/card";
import { Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeDetails } from "@/types/recipes";

interface RecipeCardProps {
  recipe: RecipeDetails;
  onLikeToggle?: () => void;
  onOpenDetails: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLikeToggle, onOpenDetails }) => {
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
            className="flex-1 mr-2"
          >
            View Recipe
          </Button>
          
          <div className="flex gap-2">
            {onLikeToggle && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onLikeToggle}
                className="shrink-0"
              >
                <Heart 
                  className={`h-5 w-5 ${recipe.liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                />
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;
