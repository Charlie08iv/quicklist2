
import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Share2, 
  ArrowDownAZ, 
  DollarSign, 
  CheckCheck,
  MessageSquare,
  Contact,  // Changed from Contacts to Contact
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

  const handleShare = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShareDialogOpen(true);
  };

  const handleSort = (sortType: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSort) {
      onSort(sortType);
    }
    
    toast({
      title: t("List sorted"),
      description: sortType === "name" 
        ? t("Items have been sorted alphabetically") 
        : sortType === "category" 
          ? t("Items have been sorted by category")
          : t("Items have been sorted")
    });
  };

  const handleTogglePrices = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onTogglePrices) {
      onTogglePrices();
    }
    toast({
      title: t("Prices toggled"),
      description: t("Price display has been toggled")
    });
  };

  const handleUncheckAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onUncheckAll) {
      onUncheckAll();
    }
    toast({
      title: t("Items unchecked"),
      description: t("All items have been unchecked")
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
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
          onOpenChange={(open) => setShareDialogOpen(open)} 
        />
      )}
    </>
  );
};

export default ListOptionsMenu;
