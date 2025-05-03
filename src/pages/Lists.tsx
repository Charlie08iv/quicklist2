
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, RefreshCcw } from "lucide-react";
import { getListsByDate, getUnscheduledLists } from "@/services/listService";
import { ShoppingList } from "@/types/lists";
import ShoppingListCard from "@/components/lists/ShoppingListCard";
import { motion, AnimatePresence } from "framer-motion";
import CreateListDialog from "@/components/lists/CreateListDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Lists: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [archivedLists, setArchivedLists] = useState<ShoppingList[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    if (retryCount > 3) {
      setIsLoading(false);
      setIsRefreshing(false);
      setHasError(true);
      return;
    }
    
    const isInitialLoad = lists.length === 0 && archivedLists.length === 0;
    if (isInitialLoad) setIsLoading(true);
    if (!isInitialLoad) setIsRefreshing(true);
    setHasError(false);
    
    try {
      const [listsData, unscheduledListsData] = await Promise.all([
        getListsByDate(new Date().toISOString().split('T')[0]),
        getUnscheduledLists()
      ]);
      
      const allLists = [...listsData, ...unscheduledListsData] as ShoppingList[];
      
      // Filter active and archived lists correctly
      const activeLists = allLists.filter(list => !list.archived);
      const archived = allLists.filter(list => list.archived);
      
      console.log('Fetched lists:', { 
        total: allLists.length, 
        active: activeLists.length, 
        archived: archived.length 
      });
      
      setLists(activeLists);
      setArchivedLists(archived);
      setRetryCount(0);
    } catch (error) {
      console.error("Error loading data:", error);
      setHasError(true);
      setRetryCount(prevCount => prevCount + 1);
    } finally {
      // Add a small delay to prevent rapid UI changes
      setTimeout(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      }, 300);
    }
  }, [retryCount]);

  useEffect(() => {
    loadData();
    
    return () => {
      // Clean up function
    };
  }, [loadData]);

  const handleListUpdated = useCallback(() => {
    console.log("List updated, refreshing data");
    loadData();
  }, [loadData]);
  
  const handleManualRefresh = () => {
    setRetryCount(0);
    loadData();
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

  const handleTabChange = (tab: 'active' | 'archived') => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-3 sm:px-4 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">{t("Lists")}</h1>
        <div className="flex space-x-2">
          {hasError && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              title={t("Refresh")}
              className="animate-pulse"
              disabled={isRefreshing}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-xl shadow-md border">
        <div className="grid grid-cols-2 rounded-xl overflow-hidden">
          <Button 
            variant={activeTab === "active" ? "default" : "ghost"} 
            onClick={() => handleTabChange("active")}
            className="rounded-l-xl rounded-r-none py-4 h-auto text-lg font-medium"
            disabled={isRefreshing}
          >
            {t("My Lists")}
          </Button>
          <Button 
            variant={activeTab === "archived" ? "default" : "ghost"} 
            onClick={() => handleTabChange("archived")}
            className="rounded-r-xl rounded-l-none py-4 h-auto text-lg font-medium"
            disabled={isRefreshing}
          >
            {t("Archived")}
          </Button>
        </div>
      </Card>

      {isRefreshing && (
        <div className="flex justify-center py-2">
          <Loader className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          className="space-y-4"
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
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
          ) : hasError ? (
            <Card className="overflow-hidden shadow-md rounded-xl">
              <div className="p-6 text-center">
                <p className="text-center text-muted-foreground mb-4">
                  {t("connectionIssue")}
                </p>
                <div className="flex justify-center">
                  <Button onClick={handleManualRefresh} className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    {t("tryAgain")}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {activeTab === 'active' ? (
                <>
                  {lists.length === 0 ? (
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
                      <div className="flex justify-end mb-4">
                        <CreateListDialog onListCreated={handleListUpdated} />
                      </div>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        {lists.map((list) => (
                          <motion.div
                            key={list.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.3,
                              type: "spring", 
                              stiffness: 100 
                            }}
                          >
                            <ShoppingListCard key={list.id} list={list} onListUpdated={handleListUpdated} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {archivedLists.length === 0 ? (
                    <Card className="overflow-hidden shadow-md rounded-xl">
                      <div className="p-6">
                        <p className="text-center text-muted-foreground">
                          {t("No archived lists")}
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {archivedLists.map((list) => (
                        <motion.div
                          key={list.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3,
                            type: "spring", 
                            stiffness: 100 
                          }}
                        >
                          <ShoppingListCard key={list.id} list={list} onListUpdated={handleListUpdated} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Lists;
