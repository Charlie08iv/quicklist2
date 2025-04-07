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
import { Search, Heart, Clock, Plus, Share, Utensils, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import CreateRecipeDialog from "@/components/recipes/CreateRecipeDialog";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  liked: boolean;
  image: string;
  category: string;
  isPersonal?: boolean;
}

const inspirationRecipes: Recipe[] = [
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
  {
    id: "4",
    title: "Chicken Tikka Masala",
    description: "Aromatic Indian curry with tender chicken pieces",
    prepTime: 25,
    cookTime: 40,
    liked: false,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "dinner",
  },
  {
    id: "5",
    title: "Berry Smoothie Bowl",
    description: "Refreshing smoothie bowl topped with fresh fruits and granola",
    prepTime: 10,
    cookTime: 0,
    liked: true,
    image: "https://images.unsplash.com/photo-1546039907-8d3177aee19a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "breakfast",
  },
];

const Recipes: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"my-recipes" | "inspiration">("my-recipes");
  const [personalRecipes, setPersonalRecipes] = useState<Recipe[]>([]);
  
  const handleCreateRecipe = (recipe: Recipe) => {
    setPersonalRecipes(prev => [recipe, ...prev]);
    toast({
      title: t("recipeCreated"),
      description: t("recipeCreatedDescription"),
    });
  };

  const handleToggleLike = (recipeId: string, recipeType: "personal" | "inspiration") => {
    if (recipeType === "personal") {
      setPersonalRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId ? { ...recipe, liked: !recipe.liked } : recipe
        )
      );
    }
  };

  const filteredPersonalRecipes = personalRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInspirationRecipes = inspirationRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4 pb-16">
      <div className="sticky top-0 z-10 bg-background pt-2 pb-3 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-semibold">{t("recipes")}</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {!isMobile && t("createRecipe")}
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
        
        <div className="flex gap-2 mt-3">
          <Button
            variant={viewMode === "my-recipes" ? "default" : "outline"}
            onClick={() => setViewMode("my-recipes")}
            className="flex-1"
          >
            <Utensils className="h-4 w-4 mr-1" />
            {t("myRecipes")}
          </Button>
          <Button
            variant={viewMode === "inspiration" ? "default" : "outline"}
            onClick={() => setViewMode("inspiration")}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {t("inspiration")}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === "my-recipes" && (
          <div className="space-y-4">
            {filteredPersonalRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">{t("noPersonalRecipes")}</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  {t("createYourFirstRecipe")}
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("createRecipe")}
                </Button>
              </div>
            ) : (
              filteredPersonalRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onLike={() => handleToggleLike(recipe.id, "personal")} 
                />
              ))
            )}
          </div>
        )}

        {viewMode === "inspiration" && (
          <div className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <Tabs defaultValue="all">
                <TabsList className="w-max mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                  <TabsTrigger value="vegetarian">Vegetarian</TabsTrigger>
                  <TabsTrigger value="pasta">Pasta</TabsTrigger>
                  <TabsTrigger value="dinner">Dinner</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {filteredInspirationRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onLike={() => {}} 
                      readOnly
                    />
                  ))}
                </TabsContent>
                
                {["breakfast", "vegetarian", "pasta", "dinner"].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    {filteredInspirationRecipes
                      .filter((recipe) => recipe.category === category)
                      .map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          onLike={() => {}}
                          readOnly
                        />
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}
      </div>
      
      <CreateRecipeDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        onCreateRecipe={handleCreateRecipe}
      />

      {isMobile && (
        <div className="fixed bottom-20 right-4 z-20">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

interface RecipeCardProps {
  recipe: Recipe;
  onLike: () => void;
  readOnly?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLike, readOnly = false }) => {
  const [liked, setLiked] = useState(recipe.liked);
  const isMobile = useIsMobile();
  
  const handleLike = () => {
    if (!readOnly) {
      setLiked(!liked);
      onLike();
    }
  };
  
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 px-2 py-1 opacity-90"
        >
          {recipe.category}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recipe.title}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLike}
            className={liked ? "text-red-500" : "text-muted-foreground"}
          >
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </Button>
        </div>
        <CardDescription>{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {recipe.prepTime + recipe.cookTime} min
            </span>
          </div>
          {recipe.isPersonal && (
            <Badge variant="outline" className="text-xs">
              My Recipe
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0 pb-3">
        <Button variant="outline" size={isMobile ? "sm" : "default"}>
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
