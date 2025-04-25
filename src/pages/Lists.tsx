
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { getListsByDate, getUnscheduledLists } from "@/services/listService";
import { ShoppingList } from "@/types/lists";
import ShoppingListCard from "@/components/lists/ShoppingListCard";
import { motion } from "framer-motion";
import CreateListDialog from "@/components/lists/CreateListDialog";
import { useNavigate } from "react-router-dom";

const Lists: React.FC = () => {
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [archivedLists, setArchivedLists] = useState<ShoppingList[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleListClick = (listId: string) => {
    navigate(`/lists/${listId}`);
  };

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
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <CreateListDialog onListCreated={loadData} />
        </div>
      </div>

      <Card className="rounded-xl shadow-md border">
        <div className="grid grid-cols-2 rounded-t-xl overflow-hidden">
          <Button 
            variant={activeTab === "active" ? "default" : "ghost"} 
            onClick={() => setActiveTab("active")}
            className="rounded-none py-4 h-auto text-lg font-medium"
          >
            {t("My Lists")}
          </Button>
          <Button 
            variant={activeTab === "archived" ? "default" : "ghost"} 
            onClick={() => setActiveTab("archived")}
            className="rounded-none py-4 h-auto text-lg font-medium"
          >
            {t("Archived")}
          </Button>
        </div>
      </Card>

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <Card className="p-8 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-12 w-12 rounded-full bg-muted"></div>
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
                  <div className="p-6">
                    <p className="text-center text-muted-foreground mb-4">
                      {t("No shopping lists")}
                    </p>
                    <CreateListDialog onListCreated={loadData} />
                  </div>
                </Card>
              ) : (
                <>
                  {lists.map((list) => (
                    <div key={list.id} onClick={() => handleListClick(list.id)}>
                      <ShoppingListCard list={list} onListUpdated={loadData} />
                    </div>
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
                    <div key={list.id} onClick={() => handleListClick(list.id)}>
                      <ShoppingListCard list={list} onListUpdated={loadData} />
                    </div>
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
