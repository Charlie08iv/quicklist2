
import { Card } from "@/components/ui/card";
import { ShoppingList } from "@/types/lists";
import { Calendar, ClipboardList, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useNavigate } from "react-router-dom";
import ListActionsMenu from "./ListActionsMenu";
import { differenceInDays, format, isToday, isTomorrow, addDays } from "date-fns";

interface ShoppingListCardProps {
  list: ShoppingList;
  onListUpdated: () => void;
  showUnarchiveButton?: boolean;
  onUnarchive?: () => void;
}

export default function ShoppingListCard({ 
  list, 
  onListUpdated,
  showUnarchiveButton = false,
  onUnarchive
}: ShoppingListCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleListClick = () => {
    // Navigate to the list details page
    navigate(`/lists/${list.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDateInfo = (dateString?: string) => {
    if (!dateString) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    if (isToday(date)) {
      return t("Today");
    } else if (isTomorrow(date)) {
      return t("Tomorrow");
    } else {
      const daysUntil = differenceInDays(date, today);
      if (daysUntil > 0) {
        return t("In {{count}} days", { count: daysUntil });
      } else if (daysUntil < 0) {
        return t("{{count}} days ago", { count: Math.abs(daysUntil) });
      }
    }
    
    return formatDate(dateString);
  };

  const handleUnarchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnarchive) {
      onUnarchive();
    }
  };

  return (
    <Card className="overflow-hidden shadow-md rounded-xl">
      <div className="flex justify-between items-center p-4">
        <div className="flex-1 cursor-pointer" onClick={handleListClick}>
          <h3 className="text-lg font-medium text-foreground truncate">{list.name}</h3>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center text-xs gap-1 text-muted-foreground">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{t("listItems", { count: list.items.length })}</span>
            </div>
            
            {list.date && (
              <div className="flex items-center text-xs gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span title={formatDate(list.date) || undefined}>
                  {getDateInfo(list.date)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          {showUnarchiveButton && onUnarchive && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleUnarchive}
              title={t("Unarchive list")}
            >
              <ArchiveRestore className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">
                {t("Unarchive")}
              </span>
            </Button>
          )}
          <ListActionsMenu list={list} onListUpdated={onListUpdated} />
        </div>
      </div>
    </Card>
  );
}
