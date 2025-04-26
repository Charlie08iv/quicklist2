import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Sparkles, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import CreateRecipeDialog from "@/components/recipes/CreateRecipeDialog";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "Breakfast", "Vegetarian", "Pasta", "Dinner"];

const Recipes: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("myRecipes");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("recipes")}</h1>
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
            <Utensils className="w-4 h-4" />
            {t("myRecipes")}
          </TabsTrigger>
          <TabsTrigger value="inspiration" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t("inspiration")}
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="flex-shrink-0"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

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
                onClick={() => setCreateDialogOpen(true)}
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
        onCreateRecipe={() => {}}
      />
    </div>
  );
};

export default Recipes;
