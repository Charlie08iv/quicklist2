
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getDatesWithItems } from "@/services/listService";
import { DateWithMarker } from "@/types/lists";

interface CalendarWithIndicatorsProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const CalendarWithIndicators: React.FC<CalendarWithIndicatorsProps> = ({ 
  selectedDate, 
  onDateSelect 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [datesWithItems, setDatesWithItems] = useState<Date[]>([]);

  useEffect(() => {
    const fetchDatesWithItems = async () => {
      const dates = await getDatesWithItems();
      setDatesWithItems(dates);
    };

    fetchDatesWithItems();
  }, []);

  // Custom day renderer to show indicators
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
          <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center justify-between w-full p-2 text-left font-normal"
        >
          <span className="font-medium">
            {selectedDate ? selectedDate.toLocaleDateString("en-US", { 
              month: "long", 
              day: "numeric", 
              year: "numeric" 
            }) : "Select a date"}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CalendarWithIndicators;
