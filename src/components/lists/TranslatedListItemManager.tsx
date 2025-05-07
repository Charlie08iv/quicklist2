import React from "react";
import { useTranslation } from "@/hooks/use-translation";
import ListItemManager from "./ListItemManager";
import type { ShoppingItem } from "@/types/lists";

interface TranslatedListItemManagerProps {
  listId: string;
  items: ShoppingItem[];
  onAddItem?: (item: Omit<ShoppingItem, "id" | "checked">) => Promise<void>;
  onRemoveItem?: (itemId: string) => Promise<void>;
  onToggleItemCheck?: (itemId: string, checked: boolean) => Promise<void>;
  onUpdateItem?: (itemId: string, updates: Partial<ShoppingItem>) => Promise<void>;
  onMoveItem?: (itemId: string, direction: 'up' | 'down') => Promise<void>;
  onReorderItems?: (reorderedItems: ShoppingItem[]) => Promise<void>;
  showPrices?: boolean;
  sortType?: string;
  readOnly?: boolean;
}

const TranslatedListItemManager: React.FC<TranslatedListItemManagerProps> = ({
  listId,
  items,
  onAddItem,
  onRemoveItem,
  onToggleItemCheck,
  onUpdateItem,
  onMoveItem,
  onReorderItems,
  showPrices = false,
  sortType = 'category',
  readOnly = false,
}) => {
  const { t } = useTranslation();
  
  // Create a translatedTexts object that contains all the translations
  const translatedTexts = {
    // Categories
    "Produce": t("Produce"),
    "Dairy": t("Dairy"),
    "Meat": t("Meat"),
    "Bakery": t("Bakery"),
    "Frozen": t("Frozen"),
    "Pantry": t("Pantry"),
    "Household": t("Household"),
    "Other": t("Other"),
    // Units
    "pcs": t("pcs"),
    "kg": t("kg"),
    "g": t("g"),
    "L": t("L"),
    "ml": t("ml"),
    "box": t("box"),
    "bottle": t("bottle"),
    "can": t("can"),
    "pack": t("pack"),
    // Other UI text
    "itemNameLabel": t("Item name"),
    "itemName": t("Enter item name"),
    "quantity": t("Quantity"),
    "unit": t("Unit"),
    "selectUnit": t("Select unit"),
    "price": t("Price"),
    "enterPrice": t("Enter price"),
    "addItem": t("Add item"),
    "items": t("Items"),
    "allItems": t("All Items"),
    "customOrder": t("Custom Order"),
    "done": t("Done")
  };

  return (
    <ListItemManager
      listId={listId}
      items={items}
      onAddItem={readOnly ? undefined : onAddItem}
      onRemoveItem={readOnly ? undefined : onRemoveItem}
      onToggleItemCheck={readOnly ? undefined : onToggleItemCheck}
      onUpdateItem={readOnly ? undefined : onUpdateItem}
      onMoveItem={readOnly ? undefined : onMoveItem}
      onReorderItems={readOnly ? undefined : onReorderItems}
      translatedTexts={translatedTexts}
      showPrices={showPrices}
      sortType={sortType}
      placeholder={t("Add an item...")}
      readOnly={readOnly}
    />
  );
};

export default TranslatedListItemManager;
