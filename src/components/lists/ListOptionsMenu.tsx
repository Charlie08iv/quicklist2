
import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { MoreVertical, Share2, ArrowDownAZ, DollarSign, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import ShareOptionsDialog from "./ShareOptionsDialog";

interface ListOptionsMenuProps {
  listId: string;
  onSort?: (field: string) => void;
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

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleSort = () => {
    if (onSort) {
      onSort("name");
    }
    toast({
      title: t("List sorted"),
      description: t("Items have been sorted alphabetically")
    });
  };

  const handleTogglePrices = () => {
    if (onTogglePrices) {
      onTogglePrices();
    }
    toast({
      title: t("Prices toggled"),
      description: t("Price display has been toggled")
    });
  };

  const handleUncheckAll = () => {
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
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("Manage List")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> {t("Share list")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSort}>
            <ArrowDownAZ className="mr-2 h-4 w-4" /> {t("Sort by")}
          </DropdownMenuItem>
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
