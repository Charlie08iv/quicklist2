
import React, { useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Share2, 
  ArrowDownAZ, 
  DollarSign, 
  CheckCheck,
  MessageSquare,
  Contact,
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
import ShareOptionsDialog from "./ShareOptionsDialog";

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use useCallback to memoize event handlers
  const handleShare = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMenuOpen(false);
    setShareDialogOpen(true);
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
        message = t("Items have been sorted alphabetically");
        break;
      case "category":
        message = t("Items have been sorted by category");
        break;
      case "custom":
        message = t("Switched to custom sorting mode");
        break;
      default:
        message = t("Items have been sorted");
    }
    
    toast({
      title: t("List sorted"),
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
      title: t("Prices toggled"),
      description: t("Price display has been toggled")
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
      title: t("Items unchecked"),
      description: t("All items have been unchecked")
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
          <DropdownMenuLabel>{t("Manage List")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> {t("Share list")}
          </DropdownMenuItem>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ListOrdered className="mr-2 h-4 w-4" /> {t("Sort by")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={handleSort("category")}>
                <ListOrdered className="mr-2 h-4 w-4" /> {t("Categories")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSort("name")}>
                <ArrowDownAZ className="mr-2 h-4 w-4" /> {t("Alphabetically")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSort("custom")}>
                <Share2 className="mr-2 h-4 w-4" /> {t("Custom")}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuItem onClick={handleTogglePrices}>
            <DollarSign className="mr-2 h-4 w-4" /> {t("Show prices")}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleUncheckAll}>
            <CheckCheck className="mr-2 h-4 w-4" /> {t("Uncheck all items")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {shareDialogOpen && (
        <ShareOptionsDialog 
          listId={listId} 
          onOpenChange={(open) => {
            if (!open) {
              // Use a longer setTimeout to defer state update and prevent freezing
              setTimeout(() => {
                setShareDialogOpen(false);
              }, 50);
            }
          }} 
        />
      )}
    </>
  );
};

export default ListOptionsMenu;
