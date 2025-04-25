
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
