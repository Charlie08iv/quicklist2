
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronUp, CalendarIcon } from "lucide-react";
import { getDatesWithItems } from "@/services/listService";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchDatesWithItems = async () => {
      const dates = await getDatesWithItems();
      setDatesWithItems(dates);
    };

    fetchDatesWithItems();
  }, []);

  const formattedDate = selectedDate ? selectedDate.toLocaleDateString("en-US", { 
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  }) : t("selectDate");

  // Custom day renderer to show indicators for dates with items
  const renderDay = (day: Date) => {
    const hasItems = datesWithItems.some(d => 
      d.getDate() === day.getDate() && 
      d.getMonth() === day.getMonth() && 
      d.getFullYear() === day.getFullYear()
    );

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {day.getDate()}
        {hasItems && (
          <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-between p-3 border rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>{formattedDate}</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-2" align="center">
        <Calendar 
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="rounded-md border w-full shadow-sm"
          components={{
            Day: ({ date, ...props }) => (
              <div {...props}>
                {renderDay(date)}
              </div>
            )
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CalendarWithIndicators;
