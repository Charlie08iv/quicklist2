import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingItem } from "@/types/lists";
import { Check, ChevronDown, Minus, Plus, X, MoveUp, MoveDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ShoppingItemWithPrice extends ShoppingItem {
  price?: number;
}

interface ListItemManagerProps {
  listId: string;
  items: ShoppingItemWithPrice[];
  onAddItem: (item: Omit<ShoppingItemWithPrice, "id" | "checked">) => void;
  onRemoveItem?: (itemId: string) => void;
  onToggleItemCheck?: (itemId: string, checked: boolean) => void;
  onUpdateItem?: (itemId: string, item: Partial<ShoppingItemWithPrice>) => void;
  onMoveItem?: (itemId: string, direction: 'up' | 'down') => void;
  onReorderItems?: (reorderedItems: ShoppingItemWithPrice[]) => void;
  showPrices?: boolean;
  sortType?: string;
  translatedTexts?: Record<string, string>;
}

const units = [
  "pcs",
  "kg",
  "g",
  "l",
  "ml",
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

interface SortableItemProps {
  item: ShoppingItemWithPrice;
  onRemove?: (id: string) => void;
  onToggleCheck?: (id: string, checked: boolean) => void;
  onOpenDetails: (item: ShoppingItemWithPrice) => void;
  showPrices?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ 
  item, 
  onRemove, 
  onToggleCheck, 
  onOpenDetails,
  showPrices 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move'
  };

  return (
    <li 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between items-center p-2 hover:bg-[#2D7A46]/20 rounded-md border-b border-[#2D7A46]/10 last:border-0"
    >
      <div className="flex items-center space-x-2 flex-1">
        {onToggleCheck && (
          <button
            onClick={() => onToggleCheck(item.id, !item.checked)}
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
          onClick={() => onOpenDetails(item)}
        >
          <span className="text-white">
            {item.name}
            {item.category && (
              <span className="ml-2 text-xs text-[#2D7A46]/80">
                {categoryIcons[item.category]}
              </span>
            )}
          </span>
          {showPrices && item.price !== undefined && (
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
          onClick={() => onOpenDetails(item)}
          className="h-8 w-8 p-0 text-[#2D7A46] hover:bg-[#2D7A46]/20"
          aria-label="Edit item details"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        {onRemove && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/20"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
};

const ListItemManager: React.FC<ListItemManagerProps> = ({ 
  listId, 
  items, 
  onAddItem, 
  onRemoveItem,
  onToggleItemCheck,
  onUpdateItem,
  onMoveItem,
  onReorderItems,
  showPrices = false,
  sortType = "category",
  translatedTexts
}) => {
  const { t } = useTranslation();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingItemWithPrice | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [list, setList] = useState<{ items: ShoppingItemWithPrice[] } | null>(null);

  const getText = (key: string): string => {
    return translatedTexts?.[key] || t(key) || key;
  };

  const getCategoryName = (category: string): string => {
    const key = category.toLowerCase().replace(/\s+/g, '');
    return getText(key) || translatedTexts?.[category] || t(category) || category;
  };

  const detectCategory = (itemName: string): string => {
    const lowerName = itemName.toLowerCase();
    
    const categoryKeywords: Record<string, string[]> = {
      "Produce": [
        "apple", "banana", "orange", "lettuce", "tomato", "potato", "carrot", "onion", "fruit", "vegetable",
        "ananas", "paprika"
      ],
      "Dairy": [
        "milk", "cheese", "yogurt", "cream", "butter", "egg"
      ],
      "Meat": [
        "beef", "chicken", "pork", "steak", "fish", "meat", "sausage"
      ],
      "Bakery": [
        "bread", "cake", "cookie", "bagel", "muffin", "pastry"
      ],
      "Frozen Foods": [
        "frozen", "ice cream"
      ],
      "Canned Goods": [
        "can", "soup", "beans", "tuna"
      ],
      "Beverages": [
        "water", "soda", "juice", "coffee", "tea", "drink", "beer", "wine"
      ],
      "Spices": [
        "salt", "pepper", "spice", "herb"
      ],
      "Snacks": [
        "chip", "candy", "snack", "chocolate", "cookie"
      ],
      "Household": [
        "paper", "soap", "detergent", "cleaner", "towel"
      ]
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
      const category = detectCategory(newItemName.trim());
        
      onAddItem({
        name: newItemName.trim(),
        quantity: parseFloat(newItemQuantity) || 1,
        unit: newItemUnit,
        category: category,
        price: newItemPrice && showPrices ? parseFloat(newItemPrice) : undefined
      });
      setNewItemName("");
      setNewItemQuantity("1");
      setNewItemUnit("pcs");
      setNewItemPrice("");
    }
  };

  const openItemDetails = (item: ShoppingItemWithPrice) => {
    setSelectedItem(item);
    setEditQuantity(item.quantity.toString());
    setEditUnit(item.unit || "pcs");
    setEditPrice(item.price?.toString() || "");
    setItemDetailsOpen(true);
  };

  const handleSaveItemDetails = () => {
    if (selectedItem && onUpdateItem) {
      const updates: Partial<ShoppingItemWithPrice> = {
        quantity: parseFloat(editQuantity) || selectedItem.quantity,
        unit: editUnit
      };
      
      if (showPrices && editPrice) {
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

  const { itemsByCategory, sortedCategories, allSortedItems } = useMemo(() => {
    const itemsByCategory: Record<string, ShoppingItemWithPrice[]> = {};
    let allSortedItems: ShoppingItemWithPrice[] = [];
    
    if (sortType === "custom") {
      allSortedItems = [...items];
    } else {
      allSortedItems = [...items].sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1;
        }
        
        if (sortType === "name") {
          return a.name.localeCompare(b.name);
        }
        
        return a.name.localeCompare(b.name);
      });
    }
    
    allSortedItems.forEach(item => {
      const category = item.category || "Other";
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    
    if (sortType !== "custom") {
      Object.keys(itemsByCategory).forEach(category => {
        itemsByCategory[category].sort((a, b) => {
          if (a.checked !== b.checked) {
            return a.checked ? 1 : -1;
          }
          return a.name.localeCompare(b.name);
        });
      });
    }
    
    let sortedCategories: string[] = [];
    
    if (sortType === "name" || sortType === "custom") {
      sortedCategories = Object.keys(itemsByCategory);
    } else {
      sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return a.localeCompare(b);
      });
    }
    
    return { itemsByCategory, sortedCategories, allSortedItems };
  }, [items, sortType]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = allSortedItems.findIndex((item) => item.id === active.id);
      const newIndex = allSortedItems.findIndex((item) => item.id === over?.id);
      
      const newItems = arrayMove(allSortedItems, oldIndex, newIndex);
      
      setList(prevList => prevList ? { ...prevList, items: newItems } : null);
      
      if (onReorderItems) {
        onReorderItems(newItems);
      }
    }
  };

  const renderItemsList = () => {
    if (sortType === "name" || sortType === "custom") {
      const title = sortType === "name" ? getText("allItems") : getText("customOrder");
      const icon = sortType === "name" ? "🔤" : "📋";
      
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold bg-[#2D7A46]/20 py-1 px-2 rounded flex items-center text-white">
            <span className="mr-2">{icon}</span> {title}
          </h4>
          <ul className="space-y-1 bg-[#2D7A46]/10 rounded-lg shadow-sm p-2 border border-[#2D7A46]/20">
            {sortType === "custom" ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={allSortedItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {allSortedItems.map(item => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onRemove={onRemoveItem}
                      onToggleCheck={onToggleItemCheck}
                      onOpenDetails={openItemDetails}
                      showPrices={showPrices}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              allSortedItems.map(item => renderItem(item))
            )}
          </ul>
        </div>
      );
    }
    
    return sortedCategories.map((category) => (
      <div key={category} className="space-y-2">
        <h4 className="text-sm font-semibold bg-[#2D7A46]/20 py-1 px-2 rounded flex items-center text-white">
          <span className="mr-2">{categoryIcons[category]}</span> {getCategoryName(category)}
        </h4>
        <ul className="space-y-1 bg-[#2D7A46]/10 rounded-lg shadow-sm p-2 border border-[#2D7A46]/20">
          {itemsByCategory[category].map(item => renderItem(item))}
        </ul>
      </div>
    ));
  };

  const renderItem = (item: ShoppingItemWithPrice) => (
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
            {(sortType === "name" || sortType === "custom") && item.category && (
              <span className="ml-2 text-xs text-[#2D7A46]/80">
                {categoryIcons[item.category]}
              </span>
            )}
          </span>
          {showPrices && item.price !== undefined && (
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
        {sortType === "custom" && onMoveItem && (
          <>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onMoveItem(item.id, 'up')}
              className="h-8 w-8 p-0 text-[#2D7A46] hover:bg-[#2D7A46]/20"
              aria-label="Move item up"
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onMoveItem(item.id, 'down')}
              className="h-8 w-8 p-0 text-[#2D7A46] hover:bg-[#2D7A46]/20"
              aria-label="Move item down"
            >
              <MoveDown className="h-4 w-4" />
            </Button>
          </>
        )}
        
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
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddItem} className="space-y-4 bg-[#2D7A46]/10 p-4 rounded-lg shadow-sm border border-[#2D7A46]/20">
        <div className="space-y-2">
          <Label htmlFor="item-name" className="text-foreground">{getText("itemNameLabel")}</Label>
          <Input
            id="item-name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={getText("itemName")}
            className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="item-quantity" className="text-foreground">{getText("quantity")}</Label>
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
            <Label htmlFor="item-unit" className="text-foreground">{getText("unit")}</Label>
            <Select value={newItemUnit} onValueChange={setNewItemUnit}>
              <SelectTrigger 
                id="item-unit" 
                className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
              >
                <SelectValue placeholder={getText("selectUnit")} />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2C] border-[#2D7A46]/20 text-white">
                {units.map(unit => (
                  <SelectItem 
                    key={unit} 
                    value={unit}
                    className="text-white hover:bg-[#2D7A46]/20 focus:bg-[#2D7A46]/40"
                  >
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {showPrices && (
          <div className="space-y-2">
            <Label htmlFor="item-price" className="text-foreground">{getText("price")}</Label>
            <Input
              id="item-price"
              type="number"
              min="0.01"
              step="0.01"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder={getText("enterPrice")}
              className="bg-[#14371F] text-white border-[#2D7A46]/30 focus:border-[#2D7A46]"
            />
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full flex items-center gap-2 bg-[#2D7A46] hover:bg-[#1E5631] text-white"
        >
          <Plus className="h-4 w-4" />
          {getText("addItem")}
        </Button>
      </form>

      {items.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-foreground">{getText("items")}</h3>
          
          <div className="space-y-4">
            {renderItemsList()}
          </div>
        </div>
      )}

      <Dialog open={itemDetailsOpen} onOpenChange={setItemDetailsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] text-white border-[#2D7A46]/30" onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center text-white">
              {selectedItem?.name}
              <span className="ml-2">{selectedItem?.category && categoryIcons[selectedItem.category]}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">{getText("quantity")}</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleDecreaseQuantity}
                    className="rounded-full border-[#2D7A46]/30 bg-[#14371F]"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="text-center bg-[#14371F] text-white border-[#2D7A46]/30"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleIncreaseQuantity}
                    className="rounded-full border-[#2D7A46]/30 bg-[#14371F]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">{getText("unit")}</Label>
                <Select value={editUnit} onValueChange={setEditUnit}>
                  <SelectTrigger className="bg-[#14371F] text-white border-[#2D7A46]/30">
                    <SelectValue placeholder={getText("selectUnit")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F2C] border-[#2D7A46]/20 text-white">
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit} className="text-white hover:bg-[#2D7A46]/20">{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showPrices && (
                <div className="space-y-2">
                  <Label className="text-white">{getText("price")}</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder={getText("enterPrice")}
                    className="text-center bg-[#14371F] text-white border-[#2D7A46]/30"
                  />
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveItemDetails} 
                  className="w-24 bg-[#2D7A46] hover:bg-[#1E5631] text-white"
                >
                  {getText("done")}
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
