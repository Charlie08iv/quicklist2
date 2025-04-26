
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
    other: t("Other")
  };

  return (
    <ListItemManager
      {...props}
      translationOverrides={placeholders}
    />
  );
};

export default TranslatedListItemManager;
