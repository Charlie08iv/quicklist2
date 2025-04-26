
import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Sparkles, Utensils, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import CreateRecipeDialog from "@/components/recipes/CreateRecipeDialog";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getRecipeById, addRecipeToShoppingList } from "@/services/recipeService";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeDetailsDialog from "@/components/recipes/RecipeDetailsDialog";
import { RecipeDetails } from "@/types/recipes";
import { toast } from "@/hooks/use-toast";
import LikedRecipes from "@/components/recipes/LikedRecipes";

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
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
    setPersonalRecipes(prev => [...prev, recipe]);
    if (!recipe.isPersonal) {
      setSharedRecipes(prev => [...prev, recipe]);
    }
    toast({
      title: t("recipeCreated"),
      description: t("recipeCreatedDescription"),
    });
  };

  const handleLikeToggle = async (recipeId: string) => {
    const recipes = activeTab === "myRecipes" ? personalRecipes : allInspirationRecipes;
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (recipe) {
      const updatedRecipe = { ...recipe, liked: !recipe.liked };
      
      if (activeTab === "myRecipes") {
        setPersonalRecipes(prev => prev.map(r => r.id === recipeId ? updatedRecipe : r));
      } else {
        setSharedRecipes(prev => prev.map(r => r.id === recipeId ? updatedRecipe : r));
      }
      
      toast({
        title: updatedRecipe.liked ? "Recipe liked" : "Recipe unliked",
        description: updatedRecipe.liked ? "Added to your liked recipes" : "Removed from your liked recipes",
      });
    }
  };

  const handleOpenDetails = (recipe: RecipeDetails) => {
    setSelectedRecipe(recipe);
    setDetailsOpen(true);
  };

  const handleAddToList = async () => {
    if (!selectedRecipe) return;
    
    const success = await addRecipeToShoppingList(selectedRecipe.id);
    if (success) {
      setDetailsOpen(false);
    }
  };

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
        <TabsList className="grid w-full grid-cols-3 mb-6 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsTrigger value="myRecipes" className="flex items-center gap-2 p-4">
            <Utensils className="h-4 w-4" />
            {t("myRecipes")}
          </TabsTrigger>
          <TabsTrigger value="inspiration" className="flex items-center gap-2 p-4">
            <Sparkles className="h-4 w-4" />
            {t("inspiration")}
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2 p-4">
            <Heart className="h-4 w-4" />
            {t("liked")}
          </TabsTrigger>
        </TabsList>

        {activeTab === "inspiration" && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="flex-shrink-0 whitespace-nowrap"
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
                  onOpenDetails={() => handleOpenDetails(recipe)}
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
                onOpenDetails={() => handleOpenDetails(recipe)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liked">
          <LikedRecipes 
            recipes={[...personalRecipes, ...allInspirationRecipes]}
            onLikeToggle={handleLikeToggle}
            onOpenDetails={handleOpenDetails}
          />
        </TabsContent>
      </Tabs>
      
      <CreateRecipeDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onCreateRecipe={handleCreateRecipe}
      />

      <RecipeDetailsDialog
        recipe={selectedRecipe}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onLikeToggle={selectedRecipe ? () => handleLikeToggle(selectedRecipe.id) : undefined}
        onAddToList={handleAddToList}
      />
    </div>
  );
};

export default Recipes;
