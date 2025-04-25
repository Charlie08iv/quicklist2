
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Plus } from "lucide-react";
import { getMealsByDate, getListsByDate, getUnscheduledLists, toggleNotifications } from "@/services/listService";
import { Meal, ShoppingList } from "@/types/lists";
import ShoppingListCard from "@/components/lists/ShoppingListCard";
import { motion } from "framer-motion";
import CreateListDialog from "@/components/lists/CreateListDialog";
import { toast } from "sonner";
import ListItemManager from "@/components/lists/ListItemManager";

const Lists: React.FC = () => {
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeTab, setActiveTab] = useState("shopping");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [listsData, unscheduledListsData] = await Promise.all([
          getListsByDate(new Date().toISOString().split('T')[0]),
          getUnscheduledLists()
        ]);
        
        setLists([...listsData, ...unscheduledListsData] as ShoppingList[]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleToggleNotifications = async () => {
    const newState = !notificationsEnabled;
    const success = await toggleNotifications(newState);
    
    if (success) {
      setNotificationsEnabled(newState);
    }
  };

  const refreshData = () => {
    Promise.all([
      getListsByDate(new Date().toISOString().split('T')[0]),
      getUnscheduledLists()
    ]).then(([scheduled, unscheduled]) => {
      setLists([...scheduled, ...unscheduled] as ShoppingList[]);
    });
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
            onClick={handleToggleNotifications}
            title={notificationsEnabled ? t("disableNotifications") : t("enableNotifications")}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <CreateListDialog onListCreated={refreshData} />
        </div>
      </div>

      <Card className="rounded-xl shadow-md border">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 rounded-t-xl overflow-hidden">
            <Button 
              variant={activeTab === "shopping" ? "default" : "ghost"} 
              onClick={() => setActiveTab("shopping")}
              className="rounded-none py-4 h-auto text-lg font-medium"
            >
              {t("My Lists")}
            </Button>
            <Button 
              variant={activeTab === "meals" ? "default" : "ghost"} 
              onClick={() => setActiveTab("meals")}
              className="rounded-none py-4 h-auto text-lg font-medium"
            >
              {t("Meal Schedule")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTab === "shopping" && (
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
              {lists.length === 0 ? (
                <Card className="overflow-hidden shadow-md rounded-xl">
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground mb-4">
                      {t("No shopping lists")}
                    </p>
                    <CreateListDialog onListCreated={refreshData} />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {lists.map((list) => (
                    <ShoppingListCard key={list.id} list={list} onListUpdated={refreshData} />
                  ))}
                </>
              )}
            </>
          )}
        </motion.div>
      )}
      
      {activeTab === "meals" && (
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="rounded-xl shadow-md text-center p-6">
            <p className="text-muted-foreground">
              {t("Plan your meals using the calendar in each list's menu")}
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Lists;
