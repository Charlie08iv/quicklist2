import { supabase } from "@/integrations/supabase/client";
import { DateWithMarker, Meal, MealRow, ShoppingItem, ShoppingItemRow, ShoppingList, ShoppingListRow, mapMealFromRow, mapShoppingItemFromRow, mapShoppingListFromRow } from "@/types/lists";

export const getMealsByDate = async (date: string): Promise<Meal[]> => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('date', date);

    if (error) {
      console.error("Error fetching meals by date:", error);
      return [];
    }

    return data.map(row => mapMealFromRow(row as MealRow));
  } catch (error) {
    console.error("Error fetching meals by date:", error);
    return [];
  }
};

export const getListsByDate = async (date: string): Promise<ShoppingList[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    let query = supabase
      .from('shopping_lists')
      .select('*')
      .eq('date', date);
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_shared', true);
    }

    const { data: lists, error: listsError } = await query;

    if (listsError) {
      console.error("Error fetching shopping lists by date:", listsError);
      return [];
    }

    const listsWithItems = await Promise.all(
      lists.map(async (list) => {
        const { data: items, error: itemsError } = await supabase
          .from('shopping_items')
          .select('*')
          .eq('list_id', list.id);

        if (itemsError) {
          console.error(`Error fetching items for list ${list.id}:`, itemsError);
          return mapShoppingListFromRow(list as ShoppingListRow, []);
        }

        return mapShoppingListFromRow(list as ShoppingListRow, items.map(item => mapShoppingItemFromRow(item as ShoppingItemRow)));
      })
    );

    return listsWithItems;
  } catch (error) {
    console.error("Error fetching shopping lists by date:", error);
    return [];
  }
};

export const getUnscheduledLists = async (): Promise<ShoppingList[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    let query = supabase
      .from('shopping_lists')
      .select('*')
      .is('date', null);
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_shared', true);
    }

    const { data: lists, error: listsError } = await query;

    if (listsError) {
      console.error("Error fetching unscheduled shopping lists:", listsError);
      return [];
    }

    const listsWithItems = await Promise.all(
      lists.map(async (list) => {
        const { data: items, error: itemsError } = await supabase
          .from('shopping_items')
          .select('*')
          .eq('list_id', list.id);

        if (itemsError) {
          console.error(`Error fetching items for list ${list.id}:`, itemsError);
          return mapShoppingListFromRow(list as ShoppingListRow, []);
        }

        return mapShoppingListFromRow(list as ShoppingListRow, items.map(item => mapShoppingItemFromRow(item as ShoppingItemRow)));
      })
    );

    return listsWithItems;
  } catch (error) {
    console.error("Error fetching unscheduled shopping lists:", error);
    return [];
  }
};

export const createShoppingList = async (list: { name: string; date?: string }): Promise<ShoppingList | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || 'anonymous';
    
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({ 
        name: list.name, 
        date: list.date,
        user_id: userId,
        archived: false // Make sure new lists are not archived by default
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating shopping list:", error);
      return null;
    }

    return mapShoppingListFromRow(data as ShoppingListRow, []);
  } catch (error) {
    console.error("Error creating shopping list:", error);
    return null;
  }
};

export const toggleNotifications = async (enabled: boolean): Promise<boolean> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    if (!userId) {
      console.error("No user ID available for toggling notifications");
      return false;
    }
    
    const { error } = await supabase
      .from('app_changes')
      .insert({
        resource_type: 'user_settings',
        resource_id: userId,
        change_type: 'notification_toggle',
        details: { notifications_enabled: enabled },
        user_id: userId
      });

    if (error) {
      console.error("Error toggling notifications:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error toggling notifications:", error);
    return false;
  }
};

export const getDatesWithItems = async (): Promise<Date[]> => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('date');

    if (error) {
      console.error("Error fetching dates with meals:", error);
      return [];
    }

    const mealDates = data.map(item => new Date(item.date));

    const { data: listData, error: listError } = await supabase
      .from('shopping_lists')
      .select('date')
      .not('date', 'is', null);

    if (listError) {
      console.error("Error fetching dates with shopping lists:", listError);
      return mealDates;
    }

    const listDates = listData.map(item => new Date(item.date));

    const allDates = [...mealDates, ...listDates];
    const uniqueDates = Array.from(new Set(allDates.map(date => date.toISOString().slice(0, 10))))
      .map(dateString => new Date(dateString));

    return uniqueDates;
  } catch (error) {
    console.error("Error fetching dates with items:", error);
    return [];
  }
};

export const shareList = async (listId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('shopping_lists')
      .update({ is_shared: true })
      .eq('id', listId)
      .select('id');

    if (error) {
      console.error("Error sharing list:", error);
      return null;
    }

    // Use shared-list path instead of list to match our new route
    const shareableLink = `${window.location.origin}/shared-list/${listId}`;
    return shareableLink;
  } catch (error) {
    console.error("Error sharing list:", error);
    return null;
  }
};

export const renameShoppingList = async (listId: string, newName: string) => {
  try {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ name: newName })
      .eq('id', listId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error renaming shopping list:', error);
    return false;
  }
};

export const archiveShoppingList = async (listId: string) => {
  try {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ archived: true })
      .eq('id', listId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error archiving shopping list:', error);
    return false;
  }
};

export const unarchiveShoppingList = async (listId: string) => {
  try {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ archived: false })
      .eq('id', listId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unarchiving shopping list:', error);
    return false;
  }
};

export const planShoppingList = async (listId: string, date: string) => {
  try {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ date: date })
      .eq('id', listId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error planning shopping list:', error);
    return false;
  }
};

export const addItemToList = async (listId: string, item: Omit<ShoppingItem, 'id' | 'checked'>) => {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({
        list_id: listId,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'pcs',
        category: item.category || 'Other',
        checked: false
      })
      .select();
      
    if (error) {
      console.error('Error adding item to shopping list:', error);
      throw error;
    }
    
    return mapShoppingItemFromRow(data[0] as ShoppingItemRow);
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    throw error;
  }
};

export const removeItemFromList = async (itemId: string) => {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing item from shopping list:', error);
    return false;
  }
};

export const updateShoppingItem = async (itemId: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem | null> => {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shopping item:", error);
      return null;
    }

    return mapShoppingItemFromRow(data as ShoppingItemRow);
  } catch (error) {
    console.error("Error updating shopping item:", error);
    return null;
  }
};

export const createMeal = async (meal: { name: string; type: string; date: string }): Promise<Meal | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || 'anonymous';
    
    const { data, error } = await supabase
      .from('meals')
      .insert([{ 
        name: meal.name, 
        type: meal.type,
        date: meal.date,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating meal:", error);
      return null;
    }

    return mapMealFromRow(data as MealRow);
  } catch (error) {
    console.error("Error creating meal:", error);
    return null;
  }
};

export const deleteShoppingList = async (listId: string) => {
  try {
    // First delete all items associated with the list
    const { error: itemsError } = await supabase
      .from('shopping_items')
      .delete()
      .eq('list_id', listId);
    
    if (itemsError) {
      console.error('Error deleting shopping list items:', itemsError);
      throw itemsError;
    }
    
    // Then delete the list itself
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', listId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return false;
  }
};

export const getListById = async (listId: string): Promise<ShoppingList | null> => {
  try {
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (listError) {
      console.error("Error fetching list:", listError);
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('list_id', listId);

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      return mapShoppingListFromRow(list, []);
    }

    return mapShoppingListFromRow(list, items.map(item => mapShoppingItemFromRow(item)));
  } catch (error) {
    console.error("Error fetching list by id:", error);
    return null;
  }
};

export const updateItemOrder = async (listId: string, reorderedItems: ShoppingItem[]): Promise<boolean> => {
  try {
    // For each item, update its position in the database
    // We use Promise.all to perform all updates in parallel for better performance
    const updatePromises = reorderedItems.map((item, index) => {
      return supabase
        .from('shopping_items')
        .update({ position: index })
        .eq('id', item.id);
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    
    // Check if any updates failed
    const hasErrors = results.some(result => result.error);
    if (hasErrors) {
      console.error("Some items failed to update position:", 
        results.filter(r => r.error).map(r => r.error));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating item order:", error);
    return false;
  }
};
