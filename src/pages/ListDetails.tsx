
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

  useEffect(() => {
    if (listId) {
      loadList();
    }
  }, [listId]);

  const loadList = async () => {
    if (!listId) return;
    const listData = await getListById(listId);
    if (listData) {
      setList(listData);
    }
  };

  if (!list) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/lists')}
          className="rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{list.name}</h1>
      </div>

      <ListItemManager
        items={list.items || []}
        onAddItem={async (item) => {
          // Implementation will be handled by ListItemManager
          await loadList();
        }}
        onRemoveItem={async (itemId) => {
          // Implementation will be handled by ListItemManager
          await loadList();
        }}
        onToggleItemCheck={async (itemId, checked) => {
          // Implementation will be handled by ListItemManager
          await loadList();
        }}
        onUpdateItem={async (itemId, updates) => {
          // Implementation will be handled by ListItemManager
          await loadList();
        }}
      />
    </div>
  );
};

export default ListDetails;
