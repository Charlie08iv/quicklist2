
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, Clock, Plus, Share } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  liked: boolean;
  image: string;
  category: string;
}

const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Vegetable Stir Fry",
    description: "Quick and healthy vegetable stir fry with tofu",
    prepTime: 15,
    cookTime: 10,
    liked: true,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "vegetarian",
  },
  {
    id: "2",
    title: "Pasta Bolognese",
    description: "Classic Italian pasta with rich meat sauce",
    prepTime: 20,
    cookTime: 30,
    liked: false,
    image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "pasta",
  },
  {
    id: "3",
    title: "Avocado Toast",
    description: "Simple and nutritious breakfast with smashed avocado",
    prepTime: 10,
    cookTime: 5,
    liked: true,
    image: "https://images.unsplash.com/photo-1588137378633-dea1093d6184?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "breakfast",
  },
];

const Recipes: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes] = useState<Recipe[]>(mockRecipes);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t("recipes")}</h1>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          {t("createRecipe")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t("searchRecipes")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full mb-4 overflow-x-auto flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="vegetarian">Vegetarian</TabsTrigger>
          <TabsTrigger value="pasta">Pasta</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </TabsContent>

        <TabsContent value="liked" className="space-y-4">
          {recipes
            .filter((recipe) => recipe.liked)
            .map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
        </TabsContent>

        {["breakfast", "vegetarian", "pasta"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {recipes
              .filter((recipe) => recipe.category === category)
              .map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const [liked, setLiked] = useState(recipe.liked);
  
  return (
    <Card className="overflow-hidden">
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recipe.title}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLiked(!liked)}
            className={liked ? "text-red-500" : "text-muted-foreground"}
          >
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </Button>
        </div>
        <CardDescription>{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {recipe.prepTime + recipe.cookTime} min
          </span>
          <Badge variant="outline">{recipe.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          View Recipe
        </Button>
        <Button variant="ghost" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Recipes;
