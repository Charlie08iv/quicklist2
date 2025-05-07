
// We need to modify this component to accept a readOnly prop
// Since this file is read-only, we will create a new wrapper component
// that utilizes the existing functionality but adds the readOnly mode

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
  
  // These are the category translations
  const categories = {
    "Produce": t("Produce"),
    "Dairy": t("Dairy"),
    "Meat": t("Meat"),
    "Bakery": t("Bakery"),
    "Frozen": t("Frozen"),
    "Pantry": t("Pantry"),
    "Household": t("Household"),
    "Other": t("Other")
  };
  
  // These are the unit translations
  const units = {
    "pcs": t("pcs"),
    "kg": t("kg"),
    "g": t("g"),
    "L": t("L"),
    "ml": t("ml"),
    "box": t("box"),
    "bottle": t("bottle"),
    "can": t("can"),
    "pack": t("pack")
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
      categories={categories}
      units={units}
      showPrices={showPrices}
      sortType={sortType}
      placeholder={t("Add an item...")}
      readOnly={readOnly}
    />
  );
};

export default TranslatedListItemManager;
