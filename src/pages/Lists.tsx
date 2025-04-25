
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { getListsByDate, getUnscheduledLists } from "@/services/listService";
import { ShoppingList } from "@/types/lists";
import ShoppingListCard from "@/components/lists/ShoppingListCard";
import { motion } from "framer-motion";
import CreateListDialog from "@/components/lists/CreateListDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Lists: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [archivedLists, setArchivedLists] = useState<ShoppingList[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    const isInitialLoad = !lists.length && !archivedLists.length;
    setIsLoading(isInitialLoad);
    setIsRefreshing(!isInitialLoad);
    
    try {
      const [listsData, unscheduledListsData] = await Promise.all([
        getListsByDate(new Date().toISOString().split('T')[0]),
        getUnscheduledLists()
      ]);
      
      const allLists = [...listsData, ...unscheduledListsData] as ShoppingList[];
      setLists(allLists.filter(list => !list.archived));
      setArchivedLists(allLists.filter(list => list.archived));
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: t("Error"),
        description: t("Failed to load your shopping lists"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t, toast, lists.length, archivedLists.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleListUpdated = useCallback(() => {
    loadData();
  }, [loadData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-3 sm:px-4 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">{t("Shopping Lists")}</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            title={notificationsEnabled ? t("disableNotifications") : t("enableNotifications")}
            disabled={isRefreshing}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <CreateListDialog onListCreated={handleListUpdated} />
        </div>
      </div>

      <Card className="rounded-xl shadow-md border">
        <div className="grid grid-cols-2 rounded-t-xl overflow-hidden">
          <Button 
            variant={activeTab === "active" ? "default" : "ghost"} 
            onClick={() => setActiveTab("active")}
            className="rounded-none py-4 h-auto text-lg font-medium"
            disabled={isRefreshing}
          >
            {t("My Lists")}
          </Button>
          <Button 
            variant={activeTab === "archived" ? "default" : "ghost"} 
            onClick={() => setActiveTab("archived")}
            className="rounded-none py-4 h-auto text-lg font-medium"
            disabled={isRefreshing}
          >
            {t("Archived")}
          </Button>
        </div>
      </Card>

      {isRefreshing && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <Card className="p-8 flex justify-center">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {activeTab === 'active' ? (
              lists.length === 0 ? (
                <Card className="overflow-hidden shadow-md rounded-xl">
                  <div className="p-6 text-center">
                    <p className="text-center text-muted-foreground mb-4">
                      {t("No shopping lists")}
                    </p>
                    <div className="flex justify-center">
                      <CreateListDialog onListCreated={handleListUpdated} />
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  {lists.map((list) => (
                    <ShoppingListCard key={list.id} list={list} onListUpdated={handleListUpdated} />
                  ))}
                </>
              )
            ) : (
              archivedLists.length === 0 ? (
                <Card className="overflow-hidden shadow-md rounded-xl">
                  <div className="p-6">
                    <p className="text-center text-muted-foreground">
                      {t("No archived lists")}
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  {archivedLists.map((list) => (
                    <ShoppingListCard key={list.id} list={list} onListUpdated={handleListUpdated} />
                  ))}
                </>
              )
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Lists;
