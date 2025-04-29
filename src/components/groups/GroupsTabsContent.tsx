
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation";
import { TabContentShared } from "./TabContentShared";
import { TabContentWishlist } from "./TabContentWishlist";
import { GroupsLoading } from "./GroupsLoading";
import { GroupsErrorDisplay } from "./GroupsErrorDisplay";
import { GroupsList } from "./GroupsList";
import { EmptyGroupState } from "./EmptyGroupState";

interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invite_code: string;
}

interface GroupsTabsContentProps {
  groups: Group[];
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  debugInfo: any;
  onRetry: () => void;
  fetchAttempted: boolean;
  onCreateClick: () => void;
  onGroupDeleted: () => void;
}

export function GroupsTabsContent({
  groups,
  loading,
  authLoading,
  error,
  debugInfo,
  onRetry,
  fetchAttempted,
  onCreateClick,
  onGroupDeleted
}: GroupsTabsContentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("groups");

  return (
    <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="groups" className="text-foreground">{t("yourGroups")}</TabsTrigger>
        <TabsTrigger value="shared" className="text-foreground">{t("sharedLists")}</TabsTrigger>
        <TabsTrigger value="wishlist" className="text-foreground">{t("wishlist")}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="groups" className="space-y-4">
        {authLoading && <GroupsLoading type="auth" />}
        
        {!authLoading && loading && <GroupsLoading type="groups" />}
        
        {error && (
          <GroupsErrorDisplay 
            error={error} 
            debugInfo={debugInfo} 
            onRetry={onRetry} 
          />
        )}
        
        {!authLoading && !loading && !error && groups.length > 0 && (
          <GroupsList groups={groups} onGroupDeleted={onGroupDeleted} />
        )}
        
        {!authLoading && !loading && !error && groups.length === 0 && fetchAttempted && (
          <EmptyGroupState onCreateClick={onCreateClick} />
        )}
      </TabsContent>
      
      <TabsContent value="shared">
        <TabContentShared />
      </TabsContent>
      
      <TabsContent value="wishlist">
        <TabContentWishlist />
      </TabsContent>
    </Tabs>
  );
}
