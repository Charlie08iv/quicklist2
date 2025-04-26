
import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Utensils, Sparkles } from "lucide-react";
import CreateRecipeDialog from "@/components/recipes/CreateRecipeDialog";
import { motion } from "framer-motion";
import { RecipeDetails } from "@/types/recipes";

const Recipes: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("myRecipes");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [recipes, setRecipes] = useState<RecipeDetails[]>([]);

  const handleCreateRecipe = () => {
    setCreateDialogOpen(true);
  };

  const handleRecipeCreated = (recipe: RecipeDetails) => {
    setRecipes([...recipes, recipe]);
  };

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <Tabs
        defaultValue="myRecipes"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="myRecipes" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            {t("myRecipes")}
          </TabsTrigger>
          <TabsTrigger value="inspiration" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t("inspiration")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="myRecipes">
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
              <Button 
                onClick={handleCreateRecipe}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                {t("createRecipe")}
              </Button>
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="inspiration">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-medium mb-2 text-primary">Coming Soon</h2>
              <p className="text-muted-foreground mb-4">Recipe inspiration will be available soon.</p>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
      
      <CreateRecipeDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onCreateRecipe={handleRecipeCreated}
      />
    </div>
  );
};

export default Recipes;
