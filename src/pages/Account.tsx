
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Navigate } from "react-router-dom";

const Account: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [directSessionCheck, setDirectSessionCheck] = useState<{loading: boolean, valid: boolean}>({
    loading: true,
    valid: false
  });

  useEffect(() => {
    // Direct session check for added reliability
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setDirectSessionCheck({
          loading: false,
          valid: !!data.session
        });
        
        if (data.session?.user) {
          setEmail(data.session.user.email || "");
          
          // Try to fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (profile?.username) {
            setUsername(profile.username);
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setDirectSessionCheck({loading: false, valid: false});
      }
    };
    
    checkSession();
  }, []);

  if (loading || directSessionCheck.loading) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("verifyingAuthentication")}</p>
        </div>
      </div>
    );
  }

  // Double-check authentication to ensure account page only loads for authenticated users
  if (!user && !directSessionCheck.valid) {
    toast({
      title: t("pleaseLoginToAccessAccount"),
      description: t("You need to be logged in to access this page"),
      variant: "destructive"
    });
    return <Navigate to="/auth" />;
  }

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username 
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: t("profileUpdated"),
        description: t("Your profile has been updated successfully"),
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: t("errorUpdatingProfile"),
        description: error.message || t("There was an error updating your profile"),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t("account")}</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
          <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("profileInfo")}</CardTitle>
              <CardDescription>
                {t("updateYourPersonalDetails")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("enterUsername")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">{t("emailCannotBeChanged")}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateProfile} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : t("saveChanges")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("accountSettings")}</CardTitle>
              <CardDescription>
                {t("manageYourAccountSettings")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Settings content will be added here */}
              <p className="text-muted-foreground">{t("settingsFutureFeature")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Account;
