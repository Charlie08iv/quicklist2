
import { supabase } from "@/integrations/supabase/client";
import { RecipeDetails } from "@/types/recipes";
import { toast } from "@/hooks/use-toast";
import { createShoppingList } from "@/services/listService";

// Sample recipe details (in a real app, this would come from the database)
const recipeDetailsMap = new Map<string, RecipeDetails>([
  ["1", {
    id: "1",
    title: "Vegetable Stir Fry",
    description: "Quick and healthy vegetable stir fry with tofu",
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    ingredients: [
      { id: "1-1", name: "Firm tofu", quantity: "14", unit: "oz" },
      { id: "1-2", name: "Bell peppers", quantity: "2", unit: "medium" },
      { id: "1-3", name: "Broccoli", quantity: "1", unit: "cup" },
      { id: "1-4", name: "Carrots", quantity: "2", unit: "medium" },
      { id: "1-5", name: "Soy sauce", quantity: "3", unit: "tbsp" },
      { id: "1-6", name: "Sesame oil", quantity: "1", unit: "tbsp" },
      { id: "1-7", name: "Ginger", quantity: "1", unit: "tbsp" },
      { id: "1-8", name: "Garlic", quantity: "3", unit: "cloves" },
    ],
    instructions: [
      { id: "1-i1", step: 1, text: "Press and drain tofu, then cut into cubes." },
      { id: "1-i2", step: 2, text: "Chop all vegetables into bite-sized pieces." },
      { id: "1-i3", step: 3, text: "Heat oil in a wok or large pan over medium-high heat." },
      { id: "1-i4", step: 4, text: "Add garlic and ginger, stir for 30 seconds until fragrant." },
      { id: "1-i5", step: 5, text: "Add tofu and cook until golden, about 5 minutes." },
      { id: "1-i6", step: 6, text: "Add vegetables and stir-fry for 5-7 minutes until tender-crisp." },
      { id: "1-i7", step: 7, text: "Pour in soy sauce and toss to coat everything." },
    ],
    author: "Meal Planner",
    liked: true,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "vegetarian",
    tags: ["healthy", "quick", "vegan-option"]
  }],
  ["2", {
    id: "2",
    title: "Pasta Bolognese",
    description: "Classic Italian pasta with rich meat sauce",
    prepTime: 20,
    cookTime: 30,
    servings: 6,
    ingredients: [
      { id: "2-1", name: "Ground beef", quantity: "1", unit: "lb" },
      { id: "2-2", name: "Onion", quantity: "1", unit: "medium" },
      { id: "2-3", name: "Carrots", quantity: "2", unit: "medium" },
      { id: "2-4", name: "Celery", quantity: "2", unit: "stalks" },
      { id: "2-5", name: "Garlic", quantity: "3", unit: "cloves" },
      { id: "2-6", name: "Tomato paste", quantity: "2", unit: "tbsp" },
      { id: "2-7", name: "Crushed tomatoes", quantity: "28", unit: "oz" },
      { id: "2-8", name: "Red wine", quantity: "1/2", unit: "cup" },
      { id: "2-9", name: "Spaghetti", quantity: "1", unit: "lb" },
      { id: "2-10", name: "Parmesan cheese", quantity: "To taste", unit: "" },
    ],
    instructions: [
      { id: "2-i1", step: 1, text: "Finely dice onion, carrots, and celery." },
      { id: "2-i2", step: 2, text: "Heat olive oil in a large pot over medium heat." },
      { id: "2-i3", step: 3, text: "Add vegetables and cook until softened, about 7 minutes." },
      { id: "2-i4", step: 4, text: "Add garlic and cook for 30 seconds." },
      { id: "2-i5", step: 5, text: "Add ground beef and cook until browned." },
      { id: "2-i6", step: 6, text: "Add tomato paste and stir for 1-2 minutes." },
      { id: "2-i7", step: 7, text: "Pour in red wine and scrape up any browned bits." },
      { id: "2-i8", step: 8, text: "Add crushed tomatoes, salt, and pepper." },
      { id: "2-i9", step: 9, text: "Simmer for 20-30 minutes until thickened." },
      { id: "2-i10", step: 10, text: "Cook pasta according to package instructions." },
      { id: "2-i11", step: 11, text: "Serve sauce over pasta with grated Parmesan." },
    ],
    author: "Italian Chef",
    liked: false,
    image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "pasta",
    tags: ["italian", "comfort-food", "family-friendly"]
  }],
  ["3", {
    id: "3",
    title: "Avocado Toast",
    description: "Simple and nutritious breakfast with smashed avocado",
    prepTime: 10,
    cookTime: 5,
    servings: 2,
    ingredients: [
      { id: "3-1", name: "Bread", quantity: "2", unit: "slices" },
      { id: "3-2", name: "Avocado", quantity: "1", unit: "ripe" },
      { id: "3-3", name: "Lemon juice", quantity: "1", unit: "tsp" },
      { id: "3-4", name: "Red pepper flakes", quantity: "1/4", unit: "tsp" },
      { id: "3-5", name: "Salt", quantity: "To taste", unit: "" },
      { id: "3-6", name: "Black pepper", quantity: "To taste", unit: "" },
      { id: "3-7", name: "Cherry tomatoes", quantity: "5", unit: "sliced" },
    ],
    instructions: [
      { id: "3-i1", step: 1, text: "Toast bread to desired crispness." },
      { id: "3-i2", step: 2, text: "Cut avocado in half, remove pit, and scoop flesh into a bowl." },
      { id: "3-i3", step: 3, text: "Add lemon juice, salt, and pepper to avocado." },
      { id: "3-i4", step: 4, text: "Mash with a fork until desired consistency." },
      { id: "3-i5", step: 5, text: "Spread avocado mixture on toast." },
      { id: "3-i6", step: 6, text: "Top with sliced cherry tomatoes and red pepper flakes." },
    ],
    author: "Breakfast Lover",
    liked: true,
    image: "https://images.unsplash.com/photo-1588137378633-dea1093d6184?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "breakfast",
    tags: ["quick", "healthy", "vegetarian"]
  }],
  ["4", {
    id: "4",
    title: "Chicken Tikka Masala",
    description: "Aromatic Indian curry with tender chicken pieces",
    prepTime: 25,
    cookTime: 40,
    servings: 4,
    ingredients: [
      { id: "4-1", name: "Chicken breast", quantity: "2", unit: "lb" },
      { id: "4-2", name: "Yogurt", quantity: "1", unit: "cup" },
      { id: "4-3", name: "Lemon juice", quantity: "2", unit: "tbsp" },
      { id: "4-4", name: "Ginger", quantity: "2", unit: "tbsp" },
      { id: "4-5", name: "Garlic", quantity: "4", unit: "cloves" },
      { id: "4-6", name: "Garam masala", quantity: "2", unit: "tbsp" },
      { id: "4-7", name: "Turmeric", quantity: "1", unit: "tsp" },
      { id: "4-8", name: "Cumin", quantity: "1", unit: "tsp" },
      { id: "4-9", name: "Tomato sauce", quantity: "15", unit: "oz" },
      { id: "4-10", name: "Heavy cream", quantity: "1", unit: "cup" },
    ],
    instructions: [
      { id: "4-i1", step: 1, text: "Cut chicken into 1-inch pieces." },
      { id: "4-i2", step: 2, text: "Mix yogurt, lemon juice, half the ginger, half the garlic, and half the spices." },
      { id: "4-i3", step: 3, text: "Marinate chicken in this mixture for at least 2 hours." },
      { id: "4-i4", step: 4, text: "Thread chicken onto skewers and grill or broil until cooked through." },
      { id: "4-i5", step: 5, text: "In a large pan, sauté remaining ginger and garlic until fragrant." },
      { id: "4-i6", step: 6, text: "Add remaining spices and toast for 30 seconds." },
      { id: "4-i7", step: 7, text: "Add tomato sauce and simmer for 15 minutes." },
      { id: "4-i8", step: 8, text: "Stir in cream and cooked chicken, simmer for 10 more minutes." },
      { id: "4-i9", step: 9, text: "Serve with rice or naan bread." },
    ],
    author: "Spice Master",
    liked: false,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "dinner",
    tags: ["indian", "spicy", "curry"]
  }],
  ["5", {
    id: "5",
    title: "Berry Smoothie Bowl",
    description: "Refreshing smoothie bowl topped with fresh fruits and granola",
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    ingredients: [
      { id: "5-1", name: "Frozen mixed berries", quantity: "2", unit: "cups" },
      { id: "5-2", name: "Banana", quantity: "1", unit: "medium" },
      { id: "5-3", name: "Greek yogurt", quantity: "1/2", unit: "cup" },
      { id: "5-4", name: "Almond milk", quantity: "1/4", unit: "cup" },
      { id: "5-5", name: "Honey", quantity: "1", unit: "tbsp" },
      { id: "5-6", name: "Granola", quantity: "1/4", unit: "cup" },
      { id: "5-7", name: "Fresh berries", quantity: "1/4", unit: "cup" },
      { id: "5-8", name: "Chia seeds", quantity: "1", unit: "tbsp" },
    ],
    instructions: [
      { id: "5-i1", step: 1, text: "Add frozen berries, banana, yogurt, and almond milk to a blender." },
      { id: "5-i2", step: 2, text: "Blend on high until smooth and creamy." },
      { id: "5-i3", step: 3, text: "Add honey to taste and blend briefly to incorporate." },
      { id: "5-i4", step: 4, text: "Pour smoothie into bowls." },
      { id: "5-i5", step: 5, text: "Top with granola, fresh berries, and chia seeds." },
      { id: "5-i6", step: 6, text: "Serve immediately." },
    ],
    author: "Smoothie Expert",
    liked: true,
    image: "https://images.unsplash.com/photo-1546039907-8d3177aee19a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    category: "breakfast",
    tags: ["healthy", "quick", "vegetarian"]
  }],
]);

// Get a recipe by ID
export const getRecipeById = async (id: string): Promise<RecipeDetails | null> => {
  // In a real app, this would be a database query
  return recipeDetailsMap.get(id) || null;
};

// Add ingredients from a recipe to a shopping list
export const addRecipeToShoppingList = async (recipeId: string, listId?: string): Promise<boolean> => {
  try {
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // If no list ID is provided, create a new shopping list
    if (!listId) {
      const newList = await createShoppingList({
        name: `Ingredients for ${recipe.title}`,
      });
      listId = newList.id;
    }

    // Add all ingredients to the shopping list
    const ingredientsToAdd = recipe.ingredients.map(ingredient => ({
      list_id: listId,
      name: ingredient.name,
      quantity: parseFloat(ingredient.quantity) || 1,
      unit: ingredient.unit || '',
      checked: false
    }));

    const { error } = await supabase
      .from('shopping_items')
      .insert(ingredientsToAdd);

    if (error) throw error;

    toast({
      title: "Ingredients added",
      description: `Ingredients for ${recipe.title} have been added to your shopping list.`,
    });

    return true;
  } catch (error: any) {
    console.error("Error adding recipe to shopping list:", error);
    toast({
      title: "Failed to add ingredients",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};
