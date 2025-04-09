
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronUp, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getDatesWithItems } from "@/services/listService";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { format, addMonths, subMonths } from "date-fns";

interface CalendarWithIndicatorsProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const CalendarWithIndicators: React.FC<CalendarWithIndicatorsProps> = ({ 
  selectedDate, 
  onDateSelect 
}) => {
  const { t } = useTranslation();
  const [datesWithItems, setDatesWithItems] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchDatesWithItems = async () => {
      const dates = await getDatesWithItems();
      setDatesWithItems(dates);
    };

    fetchDatesWithItems();
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Custom day renderer to show indicators for dates with items
  const renderDay = (day: Date) => {
    const hasItems = datesWithItems.some(d => 
      d.getDate() === day.getDate() && 
      d.getMonth() === day.getMonth() && 
      d.getFullYear() === day.getFullYear()
    );
    
    const isSelected = selectedDate && 
      day.getDate() === selectedDate.getDate() && 
      day.getMonth() === selectedDate.getMonth() && 
      day.getFullYear() === selectedDate.getFullYear();

    return (
      <div className={cn(
        "relative w-full h-full flex items-center justify-center",
        isSelected && "bg-blue-400 text-white rounded-full"
      )}>
        {day.getDate()}
        {hasItems && !isSelected && (
          <div className="absolute bottom-0.5 w-1 h-1 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="calendar-wrapper">
      <div className="grid grid-cols-7 text-center mb-2">
        <div className="text-muted-foreground text-sm">{t("Su")}</div>
        <div className="text-muted-foreground text-sm">{t("Mo")}</div>
        <div className="text-muted-foreground text-sm">{t("Tu")}</div>
        <div className="text-muted-foreground text-sm">{t("We")}</div>
        <div className="text-muted-foreground text-sm">{t("Th")}</div>
        <div className="text-muted-foreground text-sm">{t("Fr")}</div>
        <div className="text-muted-foreground text-sm">{t("Sa")}</div>
      </div>
      
      <Calendar 
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className="rounded-md border w-full p-0 shadow-sm"
        classNames={{
          months: "grid gap-2",
          month: "space-y-1",
          caption: "flex justify-center relative items-center py-2 px-2",
          caption_label: "text-lg font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-muted rounded-full",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse border-spacing-0",
          head_row: "grid grid-cols-7",
          head_cell: "text-center p-0 h-8 w-8",
          row: "grid grid-cols-7 mt-0",
          cell: "text-center p-0 relative h-9 w-9 [&:has([aria-selected])]:bg-transparent",
          day: "h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-muted",
          day_today: "bg-muted font-bold",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
          Day: ({ date, ...props }) => (
            <div {...props}>
              {renderDay(date)}
            </div>
          )
        }}
      />
    </div>
  );
};

export default CalendarWithIndicators;
