
import { Database } from "@/integrations/supabase/types";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface Meal {
  id: string;
  userId: string;
  name: string;
  type: MealType;
  date: string; // ISO date string
  recipeId?: string;
  createdAt: string;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  date?: string; // Optional date for unscheduled lists
  items: ShoppingItem[];
  isShared: boolean;
  groupId?: string;
  createdAt: string;
  archived: boolean; // Changed from optional to required with a default value
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  checked: boolean;
  category?: string;
}

export interface DateWithMarker {
  date: Date;
  hasItems: boolean;
}

// Mapping types from Supabase responses to our frontend types
export interface MealRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  date: string;
  recipe_id?: string;
  created_at: string;
}

export interface ShoppingListRow {
  id: string;
  user_id: string;
  name: string;
  date?: string;
  is_shared: boolean;
  group_id?: string;
  created_at: string;
  archived: boolean; // Changed from optional to required
}

export interface ShoppingItemRow {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  unit?: string;
  checked: boolean;
  category?: string;
  created_at: string;
}

// Conversion functions
export const mapMealFromRow = (row: MealRow): Meal => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  type: row.type as MealType,
  date: row.date,
  recipeId: row.recipe_id,
  createdAt: row.created_at
});

export const mapShoppingListFromRow = (row: ShoppingListRow, items: ShoppingItem[] = []): ShoppingList => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  date: row.date,
  items,
  isShared: row.is_shared,
  groupId: row.group_id,
  createdAt: row.created_at,
  archived: row.archived || false // Provide default value of false
});

export const mapShoppingItemFromRow = (row: ShoppingItemRow): ShoppingItem => ({
  id: row.id,
  name: row.name,
  quantity: row.quantity,
  unit: row.unit,
  checked: row.checked,
  category: row.category
});
