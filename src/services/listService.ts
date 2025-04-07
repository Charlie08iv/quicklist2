
import { supabase } from "@/integrations/supabase/client";
import { 
  Meal, MealType, ShoppingList, ShoppingItem, 
  mapMealFromRow, mapShoppingListFromRow, mapShoppingItemFromRow,
  MealRow, ShoppingListRow, ShoppingItemRow
} from "@/types/lists";
import { toast } from "@/components/ui/use-toast";

// Get meals for a specific date
export async function getMealsByDate(date: string) {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('date', date)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
    if (error) throw error;
    return (data as MealRow[]).map(mapMealFromRow);
  } catch (error: any) {
    console.error("Error fetching meals:", error);
    return [];
  }
}

// Get all meals for the current user
export async function getAllMeals() {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
    if (error) throw error;
    return (data as MealRow[]).map(mapMealFromRow);
  } catch (error: any) {
    console.error("Error fetching meals:", error);
    return [];
  }
}

// Create a new meal
export async function createMeal(meal: Omit<Meal, 'id' | 'userId' | 'createdAt'>) {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('meals')
      .insert({
        user_id: userId,
        name: meal.name,
        type: meal.type,
        date: meal.date,
        recipe_id: meal.recipeId
      })
      .select();
      
    if (error) throw error;
    
    toast({
      title: "Meal added",
      description: `${meal.name} has been added to your calendar.`
    });
    
    return (data[0] as MealRow);
  } catch (error: any) {
    console.error("Error creating meal:", error);
    toast({
      title: "Failed to add meal",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
}

// Get shopping lists for a specific date
export async function getListsByDate(date?: string) {
  try {
    let query = supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    
    if (date) {
      query = query.eq('date', date);
    }
      
    const { data: listData, error: listError } = await query;
    
    if (listError) throw listError;
    
    // For each list, get its items
    const lists: ShoppingList[] = [];
    
    for (const list of (listData as ShoppingListRow[])) {
      const { data: itemData, error: itemError } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('list_id', list.id);
        
      if (itemError) throw itemError;
      
      const items = (itemData as ShoppingItemRow[]).map(mapShoppingItemFromRow);
      lists.push(mapShoppingListFromRow(list, items));
    }
    
    return lists;
  } catch (error: any) {
    console.error("Error fetching lists:", error);
    return [];
  }
}

// Get unscheduled shopping lists
export async function getUnscheduledLists() {
  try {
    const { data: listData, error: listError } = await supabase
      .from('shopping_lists')
      .select('*')
      .is('date', null)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
    if (listError) throw listError;
    
    // For each list, get its items
    const lists: ShoppingList[] = [];
    
    for (const list of (listData as ShoppingListRow[])) {
      const { data: itemData, error: itemError } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('list_id', list.id);
        
      if (itemError) throw itemError;
      
      const items = (itemData as ShoppingItemRow[]).map(mapShoppingItemFromRow);
      lists.push(mapShoppingListFromRow(list, items));
    }
    
    return lists;
  } catch (error: any) {
    console.error("Error fetching unscheduled lists:", error);
    return [];
  }
}

// Get all shopping lists
export async function getAllLists() {
  try {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
    if (error) throw error;
    return (data as ShoppingListRow[]).map(list => mapShoppingListFromRow(list));
  } catch (error: any) {
    console.error("Error fetching lists:", error);
    return [];
  }
}

// Create a new shopping list
export async function createShoppingList(list: Partial<ShoppingList>) {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: userId,
        name: list.name || 'New Shopping List',
        date: list.date || null,
        is_shared: list.isShared || false,
        group_id: list.groupId
      })
      .select();
      
    if (error) throw error;
    
    toast({
      title: "List created",
      description: "Your shopping list has been created."
    });
    
    return (data[0] as ShoppingListRow);
  } catch (error: any) {
    console.error("Error creating list:", error);
    toast({
      title: "Failed to create list",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
}

// Get dates that have meals or shopping lists
export async function getDatesWithItems(): Promise<Date[]> {
  try {
    const [meals, lists] = await Promise.all([
      getAllMeals(),
      getAllLists()
    ]);
    
    // Combine and deduplicate dates
    const dates = new Set<string>();
    
    meals.forEach(meal => {
      if (meal.date) dates.add(meal.date);
    });
    
    lists.forEach(list => {
      if (list.date) dates.add(list.date);
    });
    
    return Array.from(dates).map(dateStr => new Date(dateStr));
  } catch (error) {
    console.error("Error fetching dates with items:", error);
    return [];
  }
}

// Toggle notifications for a user
export async function toggleNotifications(enabled: boolean) {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ notifications_enabled: enabled })
      .eq('id', userId);
      
    if (error) throw error;
    
    toast({
      title: enabled ? "Notifications enabled" : "Notifications disabled",
      description: enabled ? "You will now receive notifications." : "You will no longer receive notifications."
    });
    
    return true;
  } catch (error: any) {
    console.error("Error toggling notifications:", error);
    toast({
      title: "Failed to update notifications",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
}

// Share a list
export async function shareList(listId: string) {
  try {
    const { data, error } = await supabase
      .from('shopping_lists')
      .update({ is_shared: true })
      .eq('id', listId)
      .select();
      
    if (error) throw error;
    
    // Generate a shareable link (this would typically involve creating a record in a shares table)
    const shareLink = `${window.location.origin}/shared-list/${listId}`;
    
    toast({
      title: "List shared",
      description: "Share link has been copied to your clipboard."
    });
    
    // Copy link to clipboard
    navigator.clipboard.writeText(shareLink);
    
    return shareLink;
  } catch (error: any) {
    console.error("Error sharing list:", error);
    toast({
      title: "Failed to share list",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
}
