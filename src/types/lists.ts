
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
