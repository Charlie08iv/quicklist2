
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingItem } from "@/types/lists";
import { Check, ChevronDown, Minus, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ListItemManagerProps {
  items: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, "id" | "checked">) => void;
  onRemoveItem?: (itemId: string) => void;
  onToggleItemCheck?: (itemId: string, checked: boolean) => void;
  onUpdateItem?: (itemId: string, item: Partial<ShoppingItem>) => void;
}

const categories = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Frozen Foods",
  "Canned Goods",
  "Dry Goods",
  "Beverages",
  "Spices",
  "Snacks",
  "Household",
  "Other"
];

const units = [
  "pcs",
  "kg",
  "g",
  "lb",
  "oz",
  "l",
  "ml",
  "tbsp",
  "tsp",
  "cup",
  "pack",
  "dkg"
];

// Item category icons or emoji mapping
const categoryIcons: Record<string, string> = {
  "Produce": "🥬",
  "Dairy": "🥛",
  "Meat": "🥩",
  "Bakery": "🍞",
  "Frozen Foods": "❄️",
  "Canned Goods": "🥫",
  "Dry Goods": "🌾",
  "Beverages": "🥤",
  "Spices": "🧂",
  "Snacks": "🍪",
  "Household": "🧹",
  "Other": "📦"
};

const ListItemManager: React.FC<ListItemManagerProps> = ({ 
  items, 
  onAddItem, 
  onRemoveItem,
  onToggleItemCheck,
  onUpdateItem
}) => {
  const { t } = useTranslation();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const [newItemCategory, setNewItemCategory] = useState("Other");
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem({
        name: newItemName.trim(),
        quantity: parseFloat(newItemQuantity) || 1,
        unit: newItemUnit,
        category: newItemCategory,
      });
      setNewItemName("");
      setNewItemQuantity("1");
      setNewItemUnit("pcs");
    }
  };

  const openItemDetails = (item: ShoppingItem) => {
    setSelectedItem(item);
    setEditQuantity(item.quantity.toString());
    setEditUnit(item.unit || "pcs");
    setItemDetailsOpen(true);
  };

  const handleSaveItemDetails = () => {
    if (selectedItem && onUpdateItem) {
      onUpdateItem(selectedItem.id, {
        quantity: parseFloat(editQuantity) || selectedItem.quantity,
        unit: editUnit
      });
    }
    setItemDetailsOpen(false);
  };

  const handleIncreaseQuantity = () => {
    if (editQuantity) {
      setEditQuantity((parseFloat(editQuantity) + 1).toString());
    }
  };

  const handleDecreaseQuantity = () => {
    if (editQuantity && parseFloat(editQuantity) > 1) {
      setEditQuantity((parseFloat(editQuantity) - 1).toString());
    }
  };

  // Group items by category
  const itemsByCategory: Record<string, ShoppingItem[]> = {};
  items.forEach(item => {
    const category = item.category || "Other";
    if (!itemsByCategory[category]) {
      itemsByCategory[category] = [];
    }
    itemsByCategory[category].push(item);
  });

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddItem} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">{t("Item Name")}</Label>
          <Input
            id="item-name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t("Enter item name")}
            className="border-primary/20"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="item-quantity">{t("Quantity")}</Label>
            <Input
              id="item-quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="border-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="item-unit">{t("Unit")}</Label>
            <Select value={newItemUnit} onValueChange={setNewItemUnit}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select unit")} />
              </SelectTrigger>
              <SelectContent>
                {units.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <Label htmlFor="item-category">{t("Category")}</Label>
            <Select value={newItemCategory} onValueChange={setNewItemCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select category")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{categoryIcons[category]} {t(category)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button type="submit" className="w-full flex items-center gap-2 bg-primary">
          <Plus className="h-4 w-4" />
          {t("Add Item")}
        </Button>
      </form>

      {items.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">{t("Items")}</h3>
          
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold bg-secondary/20 py-1 px-2 rounded flex items-center">
                <span className="mr-2">{categoryIcons[category]}</span> {t(category)}
              </h4>
              <ul className="space-y-1">
                {categoryItems.map(item => (
                  <li 
                    key={item.id} 
                    className="flex justify-between items-center p-2 hover:bg-accent/20 rounded-md border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {onToggleItemCheck && (
                        <button
                          onClick={() => onToggleItemCheck(item.id, !item.checked)}
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            item.checked ? "bg-green-500 text-white" : "border-2 border-gray-300"
                          )}
                        >
                          {item.checked && <Check className="h-4 w-4" />}
                        </button>
                      )}
                      <span 
                        className={cn(
                          "flex-1", 
                          item.checked ? "line-through text-gray-500" : ""
                        )}
                        onClick={() => openItemDetails(item)}
                      >
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openItemDetails(item)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                      
                      {onRemoveItem && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Dialog open={itemDetailsOpen} onOpenChange={setItemDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center">
              {selectedItem?.name}
              <span className="ml-2">{selectedItem?.category && categoryIcons[selectedItem.category]}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("Quantity")}</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleDecreaseQuantity}
                    className="rounded-full"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="text-center"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleIncreaseQuantity}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("Unit")}</Label>
                <Select value={editUnit} onValueChange={setEditUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select unit")} />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveItemDetails} className="w-24">
                  {t("Done")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListItemManager;
