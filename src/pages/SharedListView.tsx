
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn } from "lucide-react";
import TranslatedListItemManager from "@/components/lists/TranslatedListItemManager";
import { ShoppingList } from "@/types/lists";
import { getSharedList } from "@/services/listService";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const SharedListView: React.FC = () => {
  const { listId } = useParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadSharedList = async () => {
      if (!listId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const sharedList = await getSharedList(listId);
        
        if (!sharedList) {
          setNotFound(true);
        } else {
          setList(sharedList);
        }
      } catch (error) {
        console.error("Error loading shared list:", error);
        toast({
          title: t("Error"),
          description: t("Failed to load the shared list."),
          variant: "destructive"
        });
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedList();
  }, [listId, t, toast]);

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

  if (notFound || !list) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{t("listNotFound")}</h1>
        </div>
        <p>{t("The shopping list you're looking for doesn't exist or has been made private.")}</p>
        <div className="flex space-x-4 mt-8">
          <Button asChild>
            <Link to="/auth">
              <LogIn className="h-4 w-4 mr-2" />
              {t("Sign in")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">{t("Go to homepage")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{list.name}</h1>
          <span className="text-sm bg-primary/20 text-primary-foreground px-2 py-0.5 rounded">
            {t("Shared list")}
          </span>
        </div>
        
        <Button variant="outline" asChild>
          <Link to="/auth">
            <LogIn className="h-4 w-4 mr-2" />
            {t("Sign in")}
          </Link>
        </Button>
      </div>

      <div className="bg-muted/30 p-3 rounded-md text-sm">
        {t("This is a shared view. Sign in to create your own lists.")}
      </div>

      <TranslatedListItemManager
        listId={list.id}
        items={list.items || []}
        readOnly={true}
        showPrices={false}
        sortType="category"
      />
    </motion.div>
  );
};

export default SharedListView;
