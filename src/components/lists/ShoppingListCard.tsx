
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ShoppingList } from "@/types/lists";
import ListActionsMenu from "./ListActionsMenu";

interface ShoppingListCardProps {
  list: ShoppingList;
  onListUpdated: () => void;
}

const ShoppingListCard: React.FC<ShoppingListCardProps> = ({ list, onListUpdated }) => {
  const { t } = useTranslation();
  
  const progress = list.items?.length > 0
    ? (list.items.filter(item => item.checked).length / list.items.length) * 100
    : 0;
    
  const itemsCompleted = list.items?.filter(item => item.checked).length || 0;
  const totalItems = list.items?.length || 0;

  return (
    <Card className="overflow-hidden shadow-md border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="py-3 border-b bg-gradient-to-r from-secondary/30 to-secondary/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{list.name}</CardTitle>
          <ListActionsMenu list={list} onListUpdated={onListUpdated} />
        </div>
        <div className="flex justify-between items-center">
          {list.date && (
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(list.date).toLocaleDateString()}
            </CardDescription>
          )}
          <CardDescription className="text-xs font-medium">
            {itemsCompleted}/{totalItems} {t("items")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {list.items?.length > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{Math.round(progress)}% {t("completed")}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }} 
              />
            </div>
            {list.items.length > 0 && (
              <div className="pt-3 grid grid-cols-2 gap-y-1 gap-x-2 text-sm">
                {list.items.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center">
                    <span className={`truncate ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                      • {item.name}
                    </span>
                  </div>
                ))}
                {list.items.length > 4 && (
                  <div className="text-muted-foreground col-span-2 text-center mt-1">
                    +{list.items.length - 4} {t("more items")}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("This list is empty")}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ShoppingListCard;
