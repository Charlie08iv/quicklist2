
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ListItemManager from "@/components/lists/ListItemManager";
import { ShoppingList } from "@/types/lists";
import { getListById } from "@/services/listService";

const ListDetails: React.FC = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (listId) {
      loadList();
    }
  }, [listId]);

  const loadList = async () => {
    if (!listId) return;
    setIsLoading(true);
    try {
      const listData = await getListById(listId);
      if (listData) {
        setList(listData);
      } else {
        // List not found, navigate back to lists page
        navigate('/lists');
      }
    } catch (error) {
      console.error("Error loading list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/lists');
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
        <h1 className="text-2xl font-bold">{list.name}</h1>
        {list.archived && (
          <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {t("Archived")}
          </span>
        )}
      </div>

      <ListItemManager
        listId={list.id}
        items={list.items || []}
        onAddItem={async () => {
          await loadList();
        }}
        onRemoveItem={async () => {
          await loadList();
        }}
        onToggleItemCheck={async () => {
          await loadList();
        }}
        onUpdateItem={async () => {
          await loadList();
        }}
      />
    </div>
  );
};

export default ListDetails;
