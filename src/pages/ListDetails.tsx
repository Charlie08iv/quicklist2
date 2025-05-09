import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import TranslatedListItemManager from "@/components/lists/TranslatedListItemManager";
import { ShoppingList, ShoppingItem } from "@/types/lists";
import { getListById, addItemToList, removeItemFromList, updateShoppingItem, updateItemOrder, shareList } from "@/services/listService";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ListOptionsMenu from "@/components/lists/ListOptionsMenu";
import ShareOptions from "@/components/lists/ShareOptionsDialog";

const ListDetails: React.FC = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
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
          title: t("listNotFound"),
          description: t("listDoesNotExist"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading list:", error);
      toast({
        title: t("error"),
        description: t("failedToLoadList"),
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
      // Remove the price property if using prices isn't enabled
      // This avoids database errors since price column doesn't exist
      const itemToAdd = { ...item };
      if (!showPrices && 'price' in itemToAdd) {
        delete itemToAdd.price;
      }
      
      await addItemToList(listId, itemToAdd);
      await loadList();
      toast({
        title: t("itemAdded"),
        description: t("newItemAdded")
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: t("error"),
        description: t("failedToAddItem"),
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
        title: t("itemRemoved"),
        description: t("itemHasBeenRemoved")
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: t("error"),
        description: t("failedToRemoveItem"),
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
        title: t("error"),
        description: t("failedToUpdateItem"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    setIsProcessingAction(true);
    try {
      // Remove the price property if using prices isn't enabled
      // This avoids database errors since price column doesn't exist
      const updatesToSend = { ...updates };
      if (!showPrices && 'price' in updatesToSend) {
        delete updatesToSend.price;
      }
      
      await updateShoppingItem(itemId, updatesToSend);
      await loadList();
      toast({
        title: t("itemUpdated"),
        description: t("itemHasBeenUpdated")
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: t("error"),
        description: t("failedToUpdateItem"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleShare = useCallback(async () => {
    if (!list || !list.id) return;
    
    setIsSharing(true);
  }, [list]);

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

  // Handle custom order movement
  const handleMoveItem = async (itemId: string, direction: 'up' | 'down') => {
    if (!listId || !list || sortType !== 'custom') return;
    
    setIsProcessingAction(true);
    
    try {
      // For custom sorting, we'll just update the list locally for now
      // as there's no position/order column in the database yet
      // This will let the user see the changes immediately
      const updatedItems = [...(list?.items || [])];
      const itemIndex = updatedItems.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return;
      
      if (direction === 'up' && itemIndex > 0) {
        // Swap with previous item
        [updatedItems[itemIndex], updatedItems[itemIndex - 1]] = 
          [updatedItems[itemIndex - 1], updatedItems[itemIndex]];
      } else if (direction === 'down' && itemIndex < updatedItems.length - 1) {
        // Swap with next item
        [updatedItems[itemIndex], updatedItems[itemIndex + 1]] = 
          [updatedItems[itemIndex + 1], updatedItems[itemIndex]];
      }
      
      // Update the local state
      setList(prevList => prevList ? { ...prevList, items: updatedItems } : null);
      
    } catch (error) {
      console.error("Error moving item:", error);
      toast({
        title: t("Error"),
        description: t("Failed to move item"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Add new handler for reordering items via drag and drop
  const handleReorderItems = async (reorderedItems: ShoppingItem[]) => {
    if (!listId || !list) return;
    
    setIsProcessingAction(true);
    
    try {
      // First update local state for immediate UI feedback
      setList(prevList => prevList ? { ...prevList, items: reorderedItems } : null);
      
      // Then persist the changes to the database
      await updateItemOrder(listId, reorderedItems);
      
      toast({
        title: t("Order updated"),
        description: t("List order has been updated")
      });
    } catch (error) {
      console.error("Error updating item order:", error);
      toast({
        title: t("Error"),
        description: t("Failed to update item order"),
        variant: "destructive"
      });
      
      // Reload the list to restore original order if there's an error
      await loadList();
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
          <h1 className="text-2xl font-bold">{t("listNotFound")}</h1>
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
                {t("archived")}
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
              {t("share")}
            </Button>
            
            <ListOptionsMenu 
              listId={list.id}
              onSort={handleSort} 
              onUncheckAll={handleUncheckAll}
              onTogglePrices={() => setShowPrices(!showPrices)}
            />
          </div>
        </div>

        <TranslatedListItemManager
          listId={list.id}
          items={list.items || []}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onToggleItemCheck={handleToggleItemCheck}
          onUpdateItem={handleUpdateItem}
          showPrices={showPrices}
          sortType={sortType}
          onMoveItem={handleMoveItem}
          onReorderItems={handleReorderItems}
        />

        {isSharing && (
          <ShareOptions 
            listId={list.id} 
            onComplete={() => {
              setIsSharing(false);
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ListDetails;
