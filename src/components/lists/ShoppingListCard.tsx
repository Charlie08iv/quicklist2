
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

  return (
    <Card className="overflow-hidden shadow-md border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="py-3 border-b bg-gradient-to-r from-secondary/30 to-secondary/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{list.name}</CardTitle>
          <ListActionsMenu list={list} onListUpdated={onListUpdated} />
        </div>
        {list.date && (
          <CardDescription className="flex items-center gap-1 mt-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(list.date).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {list.items?.length > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{list.items.filter(item => item.checked).length} of {list.items.length} {t("itemsCompleted")}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">{t("emptyList")}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ShoppingListCard;
