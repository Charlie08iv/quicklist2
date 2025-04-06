
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
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
import { useTranslation } from "@/hooks/use-translation";

const Lists: React.FC = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Format date for display (e.g., "Monday, April 8")
  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t("lists")}</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="icon">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            {formattedDate || t("today")}
          </CardTitle>
          <CardDescription>
            Plan your meals and shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border w-full"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="meals">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="shopping">Shopping List</TabsTrigger>
        </TabsList>
        <TabsContent value="meals" className="space-y-4 pt-2">
          <MealCard title={t("breakfast")} />
          <MealCard title={t("lunch")} />
          <MealCard title={t("dinner")} />
        </TabsContent>
        <TabsContent value="shopping" className="pt-2">
          <ShoppingListCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MealCard: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">
          Add Meal
        </Button>
      </CardContent>
    </Card>
  );
};

const ShoppingListCard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-lg">Shopping List</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          No items in your shopping list yet
        </p>
        <Button variant="outline" className="w-full">
          Create Shopping List
        </Button>
      </CardContent>
    </Card>
  );
};

export default Lists;
