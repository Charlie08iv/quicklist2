
import React from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle2, ListChecks, MessageSquare, Users, Link } from "lucide-react";

const Groups: React.FC = () => {
  const { t } = useTranslation();

  const groups = [
    {
      id: "1",
      name: "Family",
      members: 4,
      lists: 3
    },
    {
      id: "2",
      name: "Friends",
      members: 6,
      lists: 2
    }
  ];

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 bg-background max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("Your Groups")}</h1>
      
      <div className="space-y-6">
        {groups.map(group => (
          <Card key={group.id} className="overflow-hidden border bg-card">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Users className="h-4 w-4 mr-1" /> 
                {group.members} {t("members")}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Card className="bg-secondary/20 border-none inline-flex items-center px-3 py-1 rounded-full">
                  <ListChecks className="h-4 w-4 mr-1" />
                  {group.lists} {t("Lists")}
                </Card>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" className="flex justify-center items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  {t("Lists")}
                </Button>
                <Button variant="outline" className="flex justify-center items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("Chat")}
                </Button>
              </div>
            </div>
            
            <div className="border-t px-6 py-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground flex items-center gap-1.5">
                <Link className="h-3.5 w-3.5" />
                {t("Invite")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Groups;
