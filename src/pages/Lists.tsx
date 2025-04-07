import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Share } from "lucide-react";
import { getMealsByDate, getListsByDate, getUnscheduledLists, toggleNotifications } from "@/services/listService";
import { Meal, ShoppingList } from "@/types/lists";
import CalendarWithIndicators from "@/components/lists/CalendarWithIndicators";
import AddMealDialog from "@/components/lists/AddMealDialog";
import CreateListDialog from "@/components/lists/CreateListDialog";
import ShareOptionsDialog from "@/components/lists/ShareOptionsDialog";
import { motion } from "framer-motion";

const Lists: React.FC = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date>(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [scheduledLists, setScheduledLists] = useState<ShoppingList[]>([]);
  const [unscheduledLists, setUnscheduledLists] = useState<ShoppingList[]>([]);
  const [activeTab, setActiveTab] = useState("meals");
  const [isLoading, setIsLoading] = useState(false);

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : t("today");

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t("lists")}</h1>
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
          <ShareOptionsDialog 
            listId={activeTab === "shopping" && scheduledLists.length > 0 
              ? scheduledLists[0].id 
              : undefined}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>{formattedDate}</CardTitle>
          <CardDescription>{t("planMealsAndShopping")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarWithIndicators 
            selectedDate={date} 
            onDateSelect={(newDate) => newDate && setDate(newDate)} 
          />
        </CardContent>
      </Card>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        defaultValue="meals"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meals">{t("meals")}</TabsTrigger>
          <TabsTrigger value="shopping">{t("shoppingList")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meals" className="space-y-4 pt-3">
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {meals.length === 0 ? (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">{t("noMeals")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {t("noMealsScheduled")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              meals.map((meal) => (
                <motion.div key={meal.id} variants={itemVariants}>
                  <MealCard meal={meal} />
                </motion.div>
              ))
            )}
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="pt-6">
                  <AddMealDialog date={date} onMealAdded={refreshData} />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="shopping" className="pt-3">
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {date && (
              <>
                <motion.h3 
                  className="text-lg font-medium"
                  variants={itemVariants}
                >
                  {t("listForDate", { date: formattedDate })}
                </motion.h3>
                
                {scheduledLists.length === 0 ? (
                  <motion.div variants={itemVariants}>
                    <Card>
                      <CardContent className="py-6">
                        <p className="text-muted-foreground mb-4 text-center">
                          {t("noListsForDate")}
                        </p>
                        <CreateListDialog date={date} onListCreated={refreshData} />
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  scheduledLists.map((list) => (
                    <motion.div key={list.id} variants={itemVariants}>
                      <ShoppingListCard list={list} />
                    </motion.div>
                  ))
                )}
              </>
            )}
            
            <motion.h3 
              className="text-lg font-medium mt-6"
              variants={itemVariants}
            >
              {t("unplannedLists")}
            </motion.h3>
            
            {unscheduledLists.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="py-6">
                    <p className="text-muted-foreground mb-4 text-center">
                      {t("noUnplannedLists")}
                    </p>
                    <CreateListDialog onListCreated={refreshData} />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              unscheduledLists.map((list) => (
                <motion.div key={list.id} variants={itemVariants}>
                  <ShoppingListCard list={list} />
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
  const { t } = useTranslation();
  
  const mealTypeLabel = {
    breakfast: t("breakfast"),
    lunch: t("lunch"),
    dinner: t("dinner")
  }[meal.type];

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{mealTypeLabel}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {new Date(meal.date).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p>{meal.name}</p>
      </CardContent>
    </Card>
  );
};

const ShoppingListCard: React.FC<{ list: ShoppingList }> = ({ list }) => {
  const { t } = useTranslation();
  
  const progress = list.items?.length > 0
    ? (list.items.filter(item => item.checked).length / list.items.length) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{list.name}</CardTitle>
          <ShareOptionsDialog listId={list.id} />
        </div>
        {list.date && (
          <CardDescription>
            {new Date(list.date).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {list.items?.length > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{list.items.filter(item => item.checked).length} of {list.items.length} {t("itemsCompleted")}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
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

export default Lists;
