
import React from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyListStateProps {
  onCreateList: () => void;
}

const EmptyListState: React.FC<EmptyListStateProps> = ({ onCreateList }) => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden shadow-md border rounded-xl">
      <CardContent className="p-8 flex flex-col items-center">
        <div className="w-32 h-32 mb-6 relative">
          {/* Cute Tomato Character */}
          <div className="w-full h-full bg-red-500 rounded-full relative">
            {/* Eyes */}
            <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            {/* Smile */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-10 h-5 border-b-2 border-black rounded-full"></div>
            {/* Leaf */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-8">
              <div className="w-full h-full bg-green-500 rounded-t-full rotate-45"></div>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-center">{t("No Shopping Lists Yet")}</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          {t("Create your first shopping list to organize your groceries and never forget what to buy again.")}
        </p>
        
        <Button 
          size="lg"
          className="flex items-center gap-2" 
          onClick={onCreateList}
        >
          <Plus className="h-5 w-5" />
          {t("Create Your First List")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyListState;
