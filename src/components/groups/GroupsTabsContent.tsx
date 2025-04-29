
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation";
import { TabContentShared } from "./TabContentShared";
import { TabContentWishlist } from "./TabContentWishlist";
import { GroupsLoading } from "./GroupsLoading";
import { GroupsErrorDisplay } from "./GroupsErrorDisplay";
import { GroupsList } from "./GroupsList";
import { EmptyGroupState } from "./EmptyGroupState";
import { supabase, verifyAuth } from "@/integrations/supabase/client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

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
  const [sessionState, setSessionState] = useState<string>("checking");
  
  // Check session on mount
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        console.log("GroupsTabsContent: Checking session...");
        const { isAuthenticated } = await verifyAuth();
        
        if (mounted) {
          setSessionState(isAuthenticated ? "authenticated" : "unauthenticated");
          console.log("GroupsTabsContent: Session state -", isAuthenticated ? "authenticated" : "unauthenticated");
        }
      } catch (e) {
        console.error("Error checking session in GroupsTabsContent:", e);
        if (mounted) {
          setSessionState("error");
        }
      }
    };
    
    checkSession();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {/* Auth Status Indicator - visible in all environments for debugging */}
      <div className="mb-4 p-2 bg-gray-100 rounded-md text-xs">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            sessionState === 'authenticated' ? 'bg-green-500' : 
            sessionState === 'unauthenticated' ? 'bg-red-500' : 
            'bg-yellow-500'
          }`}></div>
          <p>Session: {sessionState}</p>
        </div>
        <p>Auth loading: {authLoading ? 'true' : 'false'}</p>
        <p>Content loading: {loading ? 'true' : 'false'}</p>
        <p>Groups count: {groups.length}</p>
        <p>Fetch attempted: {fetchAttempted ? 'true' : 'false'}</p>
      </div>
    
      <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="groups" className="text-foreground">{t("yourGroups")}</TabsTrigger>
          <TabsTrigger value="shared" className="text-foreground">{t("sharedLists")}</TabsTrigger>
          <TabsTrigger value="wishlist" className="text-foreground">{t("wishlist")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-4">
          {/* Authentication failed alert */}
          {sessionState === "unauthenticated" && !authLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <p className="mt-2 text-sm">
                You appear to be logged in, but your session couldn't be verified. 
                Try refreshing the page or logging in again.
              </p>
            </Alert>
          )}

          {authLoading && <GroupsLoading type="auth" />}
          
          {sessionState === "checking" && !authLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <p>Verifying your session...</p>
            </div>
          )}
          
          {!authLoading && loading && sessionState === "authenticated" && <GroupsLoading type="groups" />}
          
          {error && (
            <GroupsErrorDisplay 
              error={error} 
              debugInfo={debugInfo} 
              onRetry={onRetry} 
            />
          )}
          
          {!authLoading && !loading && !error && groups.length > 0 && sessionState === "authenticated" && (
            <GroupsList groups={groups} onGroupDeleted={onGroupDeleted} />
          )}
          
          {!authLoading && !loading && !error && groups.length === 0 && fetchAttempted && sessionState === "authenticated" && (
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
    </>
  );
}
