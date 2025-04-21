
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        isSelected && "bg-primary text-primary-foreground rounded-full"
      )}>
        {day.getDate()}
        {hasItems && !isSelected && (
          <div className="absolute bottom-0.5 w-1 h-1 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="calendar-wrapper rounded-xl overflow-hidden">
      <div className="flex justify-between items-center mb-2 p-1">
        <button 
          onClick={handlePreviousMonth}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-base font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button 
          onClick={handleNextMonth}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 text-center mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-muted-foreground text-xs">
            {t(day)}
          </div>
        ))}
      </div>
      
      <Calendar 
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className="rounded-md border-none w-full p-0"
        classNames={{
          months: "grid gap-1",
          month: "space-y-1",
          caption: "hidden", // We're using our own header
          table: "w-full border-collapse border-spacing-0",
          head_row: "hidden", // We're using our own header
          row: "grid grid-cols-7 mt-0",
          cell: "text-center p-0 relative h-8 w-8 [&:has([aria-selected])]:bg-transparent",
          day: "h-8 w-8 p-0 flex items-center justify-center text-sm rounded-full hover:bg-muted",
          day_today: "font-bold border border-primary/30",
          day_outside: "text-muted-foreground/50",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        }}
        components={{
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
