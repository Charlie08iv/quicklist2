
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import ListItemManager from "@/components/lists/ListItemManager";
import { ShoppingList } from "@/types/lists";
import { getListById, addItemToList, removeItemFromList, updateShoppingItem } from "@/services/listService";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ListOptionsMenu from "@/components/lists/ListOptionsMenu";
import ShareOptionsDialog from "@/components/lists/ShareOptionsDialog";

const ListDetails: React.FC = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sortType, setSortType] = useState("category"); // Default sort by category

  const loadList = useCallback(async () => {
    if (!listId) return;
    
    // Don't set loading state if we already have list data
    // This prevents flickering when refreshing data
    if (!list) {
      setIsLoading(true);
    }
    
    try {
      const listData = await getListById(listId);
      if (listData) {
        // Use functional update to prevent race conditions
        setList(prevList => {
          // Only update if there are actual changes
          // This prevents unnecessary re-renders
          if (!prevList || JSON.stringify(prevList) !== JSON.stringify(listData)) {
            return listData;
          }
          return prevList;
        });
      } else {
        // List not found, navigate back to lists page
        navigate('/lists');
        toast({
          title: t("List not found"),
          description: t("The list you're looking for doesn't exist or has been deleted"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading list:", error);
      toast({
        title: t("Error"),
        description: t("Failed to load list details"),
        variant: "destructive"
      });
    } finally {
      // Add a small delay to prevent rapid UI changes
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, [listId, navigate, t, toast, list]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleBackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/lists');
  }, [navigate]);

  const handleAddItem = async (item) => {
    if (!listId) return;
    setIsProcessingAction(true);
    
    try {
      await addItemToList(listId, item);
      await loadList();
      toast({
        title: t("Item added"),
        description: t("New item has been added to your list")
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: t("Error"),
        description: t("Failed to add item"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setIsProcessingAction(true);
    try {
      await removeItemFromList(itemId);
      await loadList();
      toast({
        title: t("Item removed"),
        description: t("Item has been removed from your list")
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: t("Error"),
        description: t("Failed to remove item"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleToggleItemCheck = async (itemId, checked) => {
    setIsProcessingAction(true);
    try {
      await updateShoppingItem(itemId, { checked });
      await loadList();
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: t("Error"),
        description: t("Failed to update item"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    setIsProcessingAction(true);
    try {
      await updateShoppingItem(itemId, updates);
      await loadList();
      toast({
        title: t("Item updated"),
        description: t("Item has been updated")
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: t("Error"),
        description: t("Failed to update item"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  const handleSort = useCallback((type: string) => {
    setSortType(type);
  }, []);

  const handleUncheckAll = async () => {
    if (!list || !list.items) return;
    
    setIsProcessingAction(true);
    try {
      const checkedItems = list.items.filter(item => item.checked);
      
      // Reduce number of API calls by using Promise.all
      await Promise.all(
        checkedItems.map(item => updateShoppingItem(item.id, { checked: false }))
      );
      
      await loadList();
      toast({
        title: t("Items unchecked"),
        description: t("All items have been unchecked")
      });
    } catch (error) {
      console.error("Error unchecking items:", error);
      toast({
        title: t("Error"),
        description: t("Failed to uncheck items"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-32 bg-muted rounded w-full max-w-md"></div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t("List not found")}</h1>
        </div>
        <p>{t("The shopping list you're looking for doesn't exist or has been deleted.")}</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl mx-auto px-4 py-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="rounded-full"
              disabled={isProcessingAction}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            {list.archived && (
              <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {t("Archived")}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={handleShare}
              disabled={isProcessingAction}
            >
              <Share2 className="h-4 w-4" />
              {t("Share")}
            </Button>
            
            <ListOptionsMenu 
              listId={list.id}
              onSort={handleSort} 
              onUncheckAll={handleUncheckAll}
              onTogglePrices={() => setShowPrices(!showPrices)}
            />
          </div>
        </div>

        <ListItemManager
          listId={list.id}
          items={list.items || []}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onToggleItemCheck={handleToggleItemCheck}
          onUpdateItem={handleUpdateItem}
          showPrices={showPrices}
          sortType={sortType}
        />

        {showShareDialog && (
          <ShareOptionsDialog 
            listId={list.id} 
            onOpenChange={setShowShareDialog}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ListDetails;
