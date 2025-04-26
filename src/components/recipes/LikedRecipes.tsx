
import React from "react";
import RecipeCard from "./RecipeCard";
import { RecipeDetails } from "@/types/recipes";

interface LikedRecipesProps {
  recipes: RecipeDetails[];
  onLikeToggle: (recipeId: string) => void;
  onOpenDetails: (recipe: RecipeDetails) => void;
}

const LikedRecipes: React.FC<LikedRecipesProps> = ({ 
  recipes,
  onLikeToggle,
  onOpenDetails,
}) => {
  const likedRecipes = recipes.filter(recipe => recipe.liked);

  if (likedRecipes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No liked recipes yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {likedRecipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe}
          onOpenDetails={() => onOpenDetails(recipe)}
        />
      ))}
    </div>
  );
};

export default LikedRecipes;
