import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Sparkles, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import CreateRecipeDialog from "@/components/recipes/CreateRecipeDialog";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getRecipeById } from "@/services/recipeService";
import RecipeCard from "@/components/recipes/RecipeCard";
import { RecipeDetails } from "@/types/recipes";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Breakfast", "Vegetarian", "Pasta", "Dinner"];
const SAMPLE_RECIPE_IDS = ["1", "2", "3", "4", "5"];

const Recipes: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("myRecipes");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [personalRecipes, setPersonalRecipes] = useState<RecipeDetails[]>([]);
  const [sharedRecipes, setSharedRecipes] = useState<RecipeDetails[]>([]);

  const { data: inspirationRecipes = [] } = useQuery({
    queryKey: ['inspiration-recipes'],
    queryFn: async () => {
      const recipes = await Promise.all(
        SAMPLE_RECIPE_IDS.map(id => getRecipeById(id))
      );
      return recipes.filter(recipe => recipe !== null);
    }
  });

  const handleCreateRecipe = (recipe: RecipeDetails) => {
    // Add the recipe to the personal recipes list
    setPersonalRecipes(prev => [...prev, recipe]);
    
    // If the recipe is public (not personal), add it to shared recipes
    if (!recipe.isPersonal) {
      setSharedRecipes(prev => [...prev, recipe]);
    }
    
    toast({
      title: t("recipeCreated"),
      description: t("recipeCreatedDescription"),
    });
  };

  const handleLikeToggle = async (recipeId: string) => {
    // Toggle like for personal recipes
    if (activeTab === "myRecipes") {
      setPersonalRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, liked: !recipe.liked } 
            : recipe
        )
      );
    }
    
    // Toggle like for inspiration recipes
    if (activeTab === "inspiration") {
      setSharedRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, liked: !recipe.liked } 
            : recipe
        )
      );
    }
    
    console.log("Toggle like for recipe:", recipeId);
  };

  // Combine inspiration recipes with shared recipes for the inspiration tab
  const allInspirationRecipes = [...inspirationRecipes, ...sharedRecipes];

  const filteredInspiration = allInspirationRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredPersonal = personalRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-bold text-primary">Recipe</span>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-5 w-5" />
          {t("createRecipe")}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchRecipes")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="myRecipes" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="myRecipes" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            {t("myRecipes")}
          </TabsTrigger>
          <TabsTrigger value="inspiration" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t("inspiration")}
          </TabsTrigger>
        </TabsList>

        {activeTab === "inspiration" && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="flex-shrink-0"
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        <TabsContent value="myRecipes">
          {filteredPersonal.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPersonal.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe}
                  onLikeToggle={() => handleLikeToggle(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Utensils className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-medium mb-2 text-primary">{t("noPersonalRecipes")}</h2>
                <p className="text-muted-foreground mb-8">{t("createYourFirstRecipe")}</p>
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    {t("createRecipe")}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inspiration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInspiration.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe}
                onLikeToggle={() => handleLikeToggle(recipe.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <CreateRecipeDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onCreateRecipe={handleCreateRecipe}
      />
    </div>
  );
};

export default Recipes;
