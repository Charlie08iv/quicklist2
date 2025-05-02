import React, { useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Share2, 
  ArrowDownAZ, 
  DollarSign, 
  CheckCheck,
  ListOrdered
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import ShareOptions from "./ShareOptionsDialog";

interface ListOptionsMenuProps {
  listId: string;
  onSort?: (sortType: string) => void;
  onUncheckAll?: () => void;
  onTogglePrices?: () => void;
}

const ListOptionsMenu: React.FC<ListOptionsMenuProps> = ({
  listId,
  onSort,
  onUncheckAll,
  onTogglePrices,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use useCallback to memoize event handlers
  const handleShare = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMenuOpen(false);
    setIsSharing(true);
  }, []);

  const handleSort = useCallback((sortType: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsMenuOpen(false);
    
    if (onSort) {
      onSort(sortType);
    }
    
    let message = "";
    switch (sortType) {
      case "name":
        message = t("itemsAlphabetically");
        break;
      case "category":
        message = t("itemsByCategory");
        break;
      case "custom":
        message = t("customSorting");
        break;
      default:
        message = t("itemsSorted");
    }
    
    toast({
      title: t("listSorted"),
      description: message
    });
  }, [onSort, toast, t]);

  const handleTogglePrices = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsMenuOpen(false);
    
    if (onTogglePrices) {
      onTogglePrices();
    }
    toast({
      title: t("pricesToggled"),
      description: t("priceDisplay")
    });
  }, [onTogglePrices, toast, t]);

  const handleUncheckAll = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsMenuOpen(false);
    
    if (onUncheckAll) {
      onUncheckAll();
    }
    toast({
      title: t("itemsUnchecked"),
      description: t("itemsUnchecked")
    });
  }, [onUncheckAll, toast, t]);

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          onClick={e => e.stopPropagation()}
          onEscapeKeyDown={() => setIsMenuOpen(false)}
        >
          <DropdownMenuLabel>{t("manageList")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> {t("shareList")}
          </DropdownMenuItem>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ListOrdered className="mr-2 h-4 w-4" /> {t("sortBy")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={handleSort("category")}>
                <ListOrdered className="mr-2 h-4 w-4" /> {t("categories")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSort("name")}>
                <ArrowDownAZ className="mr-2 h-4 w-4" /> {t("alphabetically")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSort("custom")}>
                <Share2 className="mr-2 h-4 w-4" /> {t("custom")}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuItem onClick={handleTogglePrices}>
            <DollarSign className="mr-2 h-4 w-4" /> {t("showPrices")}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleUncheckAll}>
            <CheckCheck className="mr-2 h-4 w-4" /> {t("uncheckAllItems")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isSharing && (
        <ShareOptions 
          listId={listId} 
          onComplete={() => setIsSharing(false)} 
        />
      )}
    </>
  );
};

export default ListOptionsMenu;
