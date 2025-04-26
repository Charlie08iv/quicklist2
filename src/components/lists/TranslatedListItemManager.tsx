
import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import ListItemManager from '@/components/lists/ListItemManager';
import { ShoppingItem } from '@/types/lists';

interface TranslatedListItemManagerProps {
  listId: string;
  items: ShoppingItem[];
  onAddItem: (item: any) => void;
  onRemoveItem: (itemId: string) => void;
  onToggleItemCheck: (itemId: string, checked: boolean) => void;
  onUpdateItem: (itemId: string, updates: any) => void;
  showPrices: boolean;
  sortType: string;
  onMoveItem?: (itemId: string, direction: 'up' | 'down') => void;
}

const TranslatedListItemManager: React.FC<TranslatedListItemManagerProps> = (props) => {
  const { t } = useTranslation();
  
  // Create translated placeholder texts
  const placeholders = {
    itemName: t("Enter item name"),
    itemNameLabel: t("Item Name"),
    quantity: t("Quantity"),
    unit: t("Unit"),
    category: t("Category"),
    addItem: t("Add Item"),
    other: t("Other"),
    done: t("Done"),
    selectUnit: t("Select unit"),
    selectCategory: t("Select category"),
    price: t("Price"),
    enterPrice: t("Enter price (optional)"),
    items: t("Items"),
    allItems: t("All Items (Alphabetical)"),
    customOrder: t("Custom Order"),
    produce: t("Produce"),
    dairy: t("Dairy"),
    meat: t("Meat"),
    bakery: t("Bakery"),
    frozenFoods: t("Frozen Foods"),
    cannedGoods: t("Canned Goods"),
    dryGoods: t("Dry Goods"),
    beverages: t("Beverages"),
    spices: t("Spices"),
    snacks: t("Snacks"),
    household: t("Household")
  };

  return (
    <ListItemManager
      {...props}
      translatedTexts={placeholders}
    />
  );
};

export default TranslatedListItemManager;
