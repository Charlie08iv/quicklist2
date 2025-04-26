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
import { cn } from "@/lib/utils";

interface ListItemManagerProps {
  listId: string;
  items: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, "id" | "checked">) => void;
  onRemoveItem?: (itemId: string) => void;
  onToggleItemCheck?: (itemId: string, checked: boolean) => void;
  onUpdateItem?: (itemId: string, item: Partial<ShoppingItem>) => void;
  showPrices?: boolean;
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
  listId, 
  items, 
  onAddItem, 
  onRemoveItem,
  onToggleItemCheck,
  onUpdateItem,
  showPrices = false
}) => {
  const { t } = useTranslation();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const [newItemCategory, setNewItemCategory] = useState("Other");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const detectCategory = (itemName: string): string => {
    const lowerName = itemName.toLowerCase();
    
    const categoryKeywords: Record<string, string[]> = {
      "Produce": ["apple", "banana", "orange", "lettuce", "tomato", "potato", "carrot", "onion", "fruit", "vegetable"],
      "Dairy": ["milk", "cheese", "yogurt", "cream", "butter", "egg"],
      "Meat": ["beef", "chicken", "pork", "steak", "fish", "meat", "sausage"],
      "Bakery": ["bread", "cake", "cookie", "bagel", "muffin", "pastry"],
      "Frozen Foods": ["ice cream", "frozen", "pizza"],
      "Canned Goods": ["can", "soup", "beans", "tuna"],
      "Beverages": ["water", "soda", "juice", "coffee", "tea", "drink", "beer", "wine"],
      "Spices": ["salt", "pepper", "spice", "herb"],
      "Snacks": ["chip", "candy", "snack", "chocolate", "cookie"],
      "Household": ["paper", "soap", "detergent", "cleaner", "towel"]
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    
    return "Other";
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      const category = newItemCategory === "Other" 
        ? detectCategory(newItemName.trim()) 
        : newItemCategory;
        
      onAddItem({
        name: newItemName.trim(),
        quantity: parseFloat(newItemQuantity) || 1,
        unit: newItemUnit,
        category: category,
        price: newItemPrice ? parseFloat(newItemPrice) : undefined
      });
      setNewItemName("");
      setNewItemQuantity("1");
      setNewItemUnit("pcs");
      setNewItemPrice("");
    }
  };

  const openItemDetails = (item: ShoppingItem) => {
    setSelectedItem(item);
    setEditQuantity(item.quantity.toString());
    setEditUnit(item.unit || "pcs");
    setEditPrice(item.price?.toString() || "");
    setItemDetailsOpen(true);
  };

  const handleSaveItemDetails = () => {
    if (selectedItem && onUpdateItem) {
      const updates: Partial<ShoppingItem> = {
        quantity: parseFloat(editQuantity) || selectedItem.quantity,
        unit: editUnit
      };
      
      if (editPrice) {
        updates.price = parseFloat(editPrice);
      }
      
      onUpdateItem(selectedItem.id, updates);
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

  const sortedItemsByCategory = () => {
    const itemsByCategory: Record<string, ShoppingItem[]> = {};
    
    items.forEach(item => {
      const category = item.category || "Other";
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    
    Object.keys(itemsByCategory).forEach(category => {
      itemsByCategory[category].sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });
    });
    
    const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
    
    return { itemsByCategory, sortedCategories };
  };
  
  const { itemsByCategory, sortedCategories } = sortedItemsByCategory();

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddItem} className="space-y-4 bg-[#2D7A46]/10 p-4 rounded-lg shadow-sm border border-[#2D7A46]/20">
        <div className="space-y-2">
          <Label htmlFor="item-name" className="text-foreground">{t("Item Name")}</Label>
          <Input
            id="item-name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t("Enter item name")}
            className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="item-quantity" className="text-foreground">{t("Quantity")}</Label>
            <Input
              id="item-quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="item-unit" className="text-foreground">{t("Unit")}</Label>
            <Select value={newItemUnit} onValueChange={setNewItemUnit}>
              <SelectTrigger 
                id="item-unit" 
                className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
              >
                <SelectValue placeholder={t("Select unit")} />
              </SelectTrigger>
              <SelectContent className="bg-[#2D7A46]/10 border-[#2D7A46]/20">
                {units.map(unit => (
                  <SelectItem 
                    key={unit} 
                    value={unit}
                    className="hover:bg-[#2D7A46]/20 focus:bg-[#2D7A46]/30"
                  >
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <Label htmlFor="item-category" className="text-foreground">{t("Category")}</Label>
            <Select value={newItemCategory} onValueChange={setNewItemCategory}>
              <SelectTrigger 
                id="item-category" 
                className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
              >
                <SelectValue placeholder={t("Select category")} />
              </SelectTrigger>
              <SelectContent className="bg-[#2D7A46]/10 border-[#2D7A46]/20">
                {categories.map(category => (
                  <SelectItem 
                    key={category} 
                    value={category}
                    className="hover:bg-[#2D7A46]/20 focus:bg-[#2D7A46]/30"
                  >
                    {categoryIcons[category]} {t(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {showPrices && (
            <div className="space-y-2 col-span-2 sm:col-span-3">
              <Label htmlFor="item-price" className="text-foreground">{t("Price")}</Label>
              <Input
                id="item-price"
                type="number"
                min="0.01"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder={t("Enter price (optional)")}
                className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
              />
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full flex items-center gap-2 bg-[#2D7A46] hover:bg-[#1E5631] text-white"
        >
          <Plus className="h-4 w-4" />
          {t("Add Item")}
        </Button>
      </form>

      {items.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-foreground">{t("Items")}</h3>
          
          {sortedCategories.map((category) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold bg-[#2D7A46]/20 py-1 px-2 rounded flex items-center text-white">
                <span className="mr-2">{categoryIcons[category]}</span> {t(category)}
              </h4>
              <ul className="space-y-1 bg-[#2D7A46]/10 rounded-lg shadow-sm p-2 border border-[#2D7A46]/20">
                {itemsByCategory[category].map(item => (
                  <li 
                    key={item.id} 
                    className="flex justify-between items-center p-2 hover:bg-[#2D7A46]/20 rounded-md border-b border-[#2D7A46]/10 last:border-0"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {onToggleItemCheck && (
                        <button
                          onClick={() => onToggleItemCheck(item.id, !item.checked)}
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            item.checked 
                              ? "bg-[#2D7A46] text-white" 
                              : "border-2 border-[#2D7A46]/50 text-[#2D7A46]"
                          )}
                          aria-label={item.checked ? "Mark as not done" : "Mark as done"}
                        >
                          {item.checked && <Check className="h-4 w-4" />}
                        </button>
                      )}
                      <div
                        className={cn(
                          "flex-1 flex flex-col", 
                          item.checked ? "line-through text-[#2D7A46]/70" : ""
                        )}
                        onClick={() => openItemDetails(item)}
                      >
                        <span className="text-white">
                          {item.name}
                        </span>
                        {showPrices && item.price && (
                          <span className="text-xs text-[#2D7A46]/80">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[#2D7A46] whitespace-nowrap">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openItemDetails(item)}
                        className="h-8 w-8 p-0 text-[#2D7A46] hover:bg-[#2D7A46]/20"
                        aria-label="Edit item details"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      
                      {onRemoveItem && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/20"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
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

              {showPrices && (
                <div className="space-y-2">
                  <Label>{t("Price")}</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder={t("Enter price (optional)")}
                    className="text-center"
                  />
                </div>
              )}
              
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
