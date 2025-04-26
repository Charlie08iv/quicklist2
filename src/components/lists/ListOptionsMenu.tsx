
import React, { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Search, MoreVertical, Share2, FileSearch, ArrowDownAZ, DollarSign, CheckCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ListOptionsMenuProps {
  listId: string;
  onSearch?: (query: string) => void;
  onSort?: (field: string) => void;
  onUncheckAll?: () => void;
  onTogglePrices?: () => void;
}

const ListOptionsMenu: React.FC<ListOptionsMenuProps> = ({
  listId,
  onSearch,
  onSort,
  onUncheckAll,
  onTogglePrices,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleSearchDialogOpen = () => {
    setSearchDialogOpen(true);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
    setSearchDialogOpen(false);
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
          <DropdownMenuItem onClick={handleSearchDialogOpen}>
            <FileSearch className="mr-2 h-4 w-4" /> {t("Search in list")}
          </DropdownMenuItem>
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

      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Search in list")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Enter search query")}
              className="flex-grow"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" /> {t("Search")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListOptionsMenu;
