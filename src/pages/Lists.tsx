import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Plus, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

import CalendarWithIndicators from "@/components/lists/CalendarWithIndicators";
import ShoppingListCard from "@/components/lists/ShoppingListCard";
import CreateListDialog from "@/components/lists/CreateListDialog";
import EmptyListState from "@/components/lists/EmptyListState";
import ListActionsMenu from "@/components/lists/ListActionsMenu";
import { getMealsByDate, getListsByDate, getUnscheduledLists, toggleNotifications, createShoppingList, createMeal } from "@/services/listService";
import { Meal, ShoppingList } from "@/types/lists";

const Lists: React.FC = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date>(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [scheduledLists, setScheduledLists] = useState<ShoppingList[]>([]);
  const [unscheduledLists, setUnscheduledLists] = useState<ShoppingList[]>([]);
  const [activeTab, setActiveTab] = useState("shopping");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBreakfastMeal, setNewBreakfastMeal] = useState("");
  const [newLunchMeal, setNewLunchMeal] = useState("");
  const [newDinnerMeal, setNewDinnerMeal] = useState("");
  
  const formattedMonth = date
    ? format(date, "MMMM yyyy")
    : "";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const dateString = date.toISOString().split('T')[0];
        
        const [mealsData, listsData, unscheduledListsData] = await Promise.all([
          getMealsByDate(dateString),
          getListsByDate(dateString),
          getUnscheduledLists()
        ]);
        
        setMeals(mealsData as Meal[]);
        setScheduledLists(listsData as ShoppingList[]);
        setUnscheduledLists(unscheduledListsData as ShoppingList[]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [date]);

  const handleToggleNotifications = async () => {
    const newState = !notificationsEnabled;
    const success = await toggleNotifications(newState);
    
    if (success) {
      setNotificationsEnabled(newState);
    }
  };

  const refreshData = () => {
    const dateString = date.toISOString().split('T')[0];
    
    if (activeTab === "meals") {
      getMealsByDate(dateString).then(data => setMeals(data as Meal[]));
    } else {
      Promise.all([
        getListsByDate(dateString),
        getUnscheduledLists()
      ]).then(([scheduled, unscheduled]) => {
        setScheduledLists(scheduled as ShoppingList[]);
        setUnscheduledLists(unscheduled as ShoppingList[]);
      });
    }
  };

  const handleListCreated = () => {
    refreshData();
    toast.success(t("List created successfully"));
  };

  const handleCreateMeal = async (type: "breakfast" | "lunch" | "dinner", mealName: string) => {
    if (!mealName.trim()) {
      return;
    }

    try {
      await createMeal({
        name: mealName,
        type,
        date: date.toISOString().split('T')[0]
      });
      
      if (type === "breakfast") setNewBreakfastMeal("");
      else if (type === "lunch") setNewLunchMeal("");
      else setNewDinnerMeal("");
      
      toast.success(`${t(type)} ${t("meal added")}`);
      refreshData();
    } catch (error) {
      console.error(`Error creating ${type} meal:`, error);
      toast.error(t("Failed to add meal"));
    }
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

  const getExistingMeal = (type: "breakfast" | "lunch" | "dinner") => {
    return meals.find(meal => meal.type === type);
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
          <Button 
            className="flex items-center gap-2 bg-primary" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
            {t("New List")}
          </Button>
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

      <Card className="rounded-xl shadow-md border">
        <CardHeader className="pb-2">
          <CardTitle>{t("Select Date")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="calendar-container">
            <div className="flex justify-between items-center mb-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                &lt;
              </button>
              <h3 className="text-xl font-medium">{formattedMonth}</h3>
              <button className="p-2 rounded-full hover:bg-gray-100">
                &gt;
              </button>
            </div>
            <CalendarWithIndicators 
              selectedDate={date} 
              onDateSelect={(newDate) => newDate && setDate(newDate)} 
            />
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
              {scheduledLists.length === 0 && unscheduledLists.length === 0 ? (
                <EmptyListState onCreateList={() => setIsCreateDialogOpen(true)} />
              ) : (
                <>
                  {unscheduledLists.map((list) => (
                    <ShoppingListCard key={list.id} list={list} onListUpdated={refreshData} />
                  ))}
                  {scheduledLists.map((list) => (
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{t("Select a date")}</h2>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleToggleNotifications}
            >
              <Bell className="h-4 w-4" />
              {t("Enable Reminders")}
            </Button>
          </div>

          <Card className="rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("Breakfast")}</CardTitle>
            </CardHeader>
            <CardContent>
              {getExistingMeal("breakfast") ? (
                <div className="p-2 bg-secondary/10 rounded">
                  <p>{getExistingMeal("breakfast")?.name}</p>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    value={newBreakfastMeal}
                    onChange={(e) => setNewBreakfastMeal(e.target.value)}
                    placeholder={t("What's for breakfast?")}
                  />
                  <Button 
                    onClick={() => handleCreateMeal("breakfast", newBreakfastMeal)}
                    disabled={!newBreakfastMeal.trim()}
                  >
                    {t("Add")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("Lunch")}</CardTitle>
            </CardHeader>
            <CardContent>
              {getExistingMeal("lunch") ? (
                <div className="p-2 bg-secondary/10 rounded">
                  <p>{getExistingMeal("lunch")?.name}</p>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    value={newLunchMeal}
                    onChange={(e) => setNewLunchMeal(e.target.value)}
                    placeholder={t("What's for lunch?")}
                  />
                  <Button 
                    onClick={() => handleCreateMeal("lunch", newLunchMeal)}
                    disabled={!newLunchMeal.trim()}
                  >
                    {t("Add")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("Dinner")}</CardTitle>
            </CardHeader>
            <CardContent>
              {getExistingMeal("dinner") ? (
                <div className="p-2 bg-secondary/10 rounded">
                  <p>{getExistingMeal("dinner")?.name}</p>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    value={newDinnerMeal}
                    onChange={(e) => setNewDinnerMeal(e.target.value)}
                    placeholder={t("What's for dinner?")}
                  />
                  <Button 
                    onClick={() => handleCreateMeal("dinner", newDinnerMeal)}
                    disabled={!newDinnerMeal.trim()}
                  >
                    {t("Add")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <CreateListDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        onListCreated={handleListCreated}
        selectedDate={date}
      />
    </div>
  );
};

export default Lists;
