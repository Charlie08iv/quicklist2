
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingItem } from "@/types/lists";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface ListItemManagerProps {
  items: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, "id" | "checked">) => void;
  onRemoveItem?: (itemId: string) => void;
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
  "pack"
];

const ListItemManager: React.FC<ListItemManagerProps> = ({ items, onAddItem, onRemoveItem }) => {
  const { t } = useTranslation();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const [newItemCategory, setNewItemCategory] = useState("Other");

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
                  <SelectItem key={category} value={category}>{t(category)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button type="submit" className="w-full flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("Add Item")}
        </Button>
      </form>

      {items.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">{t("Items")}</h3>
          
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold bg-secondary/20 py-1 px-2 rounded">{t(category)}</h4>
              <ul className="space-y-1">
                {categoryItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center p-2 hover:bg-accent/20 rounded-md">
                    <span>
                      {item.name} - {item.quantity} {item.unit}
                    </span>
                    {onRemoveItem && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListItemManager;
