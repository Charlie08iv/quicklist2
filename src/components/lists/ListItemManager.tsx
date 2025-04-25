
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Search, Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingList, ShoppingItem } from "@/types/lists";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ListItemManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: ShoppingList;
  onListUpdated: () => void;
}

const ListItemManager: React.FC<ListItemManagerProps> = ({
  open,
  onOpenChange,
  list,
  onListUpdated
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemName, setNewItemName] = useState("");
  
  // For demonstration, some popular and recent items
  const popularItems = [
    "Milk", "Bread", "Eggs", "Cheese", "Apples", "Bananas",
    "Chicken", "Rice", "Pasta", "Tomatoes", "Onions", "Potatoes"
  ];
  
  const recentItems = [
    "Coffee", "Cereal", "Yogurt", "Butter", "Orange Juice",
    "Lettuce", "Carrots", "Paper Towels"
  ];

  const handleAddItem = (name: string) => {
    // In a real app this would add the item to the list
    toast.success(`${t("Added")} ${name}`);
    onListUpdated();
  };
  
  const handleRemoveItem = (itemId: string) => {
    // In a real app this would remove the item from the list
    toast.success(t("Item removed"));
    onListUpdated();
  };
  
  const handleToggleItem = (itemId: string, checked: boolean) => {
    // In a real app this would toggle the item's checked state
    toast.success(checked ? t("Item checked") : t("Item unchecked"));
    onListUpdated();
  };
  
  const handleAddNewItem = () => {
    if (newItemName.trim()) {
      handleAddItem(newItemName);
      setNewItemName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{list.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search or add item")}
            className="pl-10 pr-10"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddNewItem();
              }
            }}
          />
          <Button
            size="sm" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
            onClick={handleAddNewItem}
            disabled={!newItemName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">{t("All")}</TabsTrigger>
            <TabsTrigger value="popular">{t("Popular")}</TabsTrigger>
            <TabsTrigger value="recent">{t("Recent")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-2 py-2 max-h-[400px] overflow-y-auto">
            {list.items && list.items.length > 0 ? (
              list.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 px-1 border-b">
                  <div className="flex items-center">
                    <Checkbox 
                      id={`item-${item.id}`} 
                      checked={item.checked} 
                      onCheckedChange={(checked) => handleToggleItem(item.id, Boolean(checked))}
                      className="mr-3"
                    />
                    <Label 
                      htmlFor={`item-${item.id}`} 
                      className={`cursor-pointer ${item.checked ? "line-through text-muted-foreground" : ""}`}
                    >
                      {item.name}
                    </Label>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">{t("Your list is empty")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Add items using the search bar or popular items")}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="popular" className="space-y-2 py-2">
            <div className="grid grid-cols-2 gap-2">
              {popularItems.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-2"
                  onClick={() => handleAddItem(item)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {item}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-2 py-2">
            <div className="grid grid-cols-2 gap-2">
              {recentItems.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-2"
                  onClick={() => handleAddItem(item)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {item}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            <Check className="h-4 w-4 mr-2" />
            {t("Done")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListItemManager;
