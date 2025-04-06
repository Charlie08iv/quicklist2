
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MessageSquare, ShoppingBag, Link } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Group {
  id: string;
  name: string;
  members: number;
  lists: number;
}

const mockGroups: Group[] = [
  {
    id: "1",
    name: "Family",
    members: 4,
    lists: 3,
  },
  {
    id: "2",
    name: "Friends",
    members: 6,
    lists: 2,
  },
];

const Groups: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t("groups")}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <JoinGroupCard />
        <CreateGroupCard />
      </div>

      <h2 className="text-lg font-medium mt-6">Your Groups</h2>

      <div className="space-y-4">
        {mockGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

const CreateGroupCard: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer h-full flex flex-col items-center justify-center hover:bg-muted/50 transition-colors border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full">
            <Plus className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">{t("createGroup")}</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createGroup")}</DialogTitle>
          <DialogDescription>
            Create a new group to share lists and recipes with others.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Group Name
            </label>
            <Input id="name" placeholder="Enter group name" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const JoinGroupCard: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer h-full flex flex-col items-center justify-center hover:bg-muted/50 transition-colors border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full">
            <Users className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">{t("joinGroup")}</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("joinGroup")}</DialogTitle>
          <DialogDescription>
            Join an existing group using an invite link or by searching for it.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="link">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Invite Link</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="invite-link" className="text-sm font-medium">
                Invite Link
              </label>
              <div className="flex space-x-2">
                <Input id="invite-link" placeholder="Paste invite link" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="search" className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="search-group" className="text-sm font-medium">
                Search by Username
              </label>
              <Input id="search-group" placeholder="Enter username" />
            </div>
            <p className="text-sm text-muted-foreground">
              You can search for users to find their shared groups.
            </p>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="submit">Join Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GroupCard: React.FC<{ group: Group }> = ({ group }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{group.name}</CardTitle>
        <CardDescription>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{group.members} members</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center">
            <ShoppingBag className="h-3 w-3 mr-1" />
            {group.lists} Lists
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Link className="h-3 w-3 mr-1" />
            Invite
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="flex items-center">
          <ShoppingBag className="h-4 w-4 mr-1" />
          Lists
        </Button>
        <Button variant="outline" size="sm" className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          Chat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Groups;
