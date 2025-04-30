
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Lock, Trash2, ArrowLeft, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";

const Account = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Initialize user data when the component mounts
  useEffect(() => {
    if (user) {
      // Set email from user data immediately
      setEmail(user.email || "");
      setName(user.user_metadata?.name || "");
      loadProfile();
      
      console.log("Account page - User loaded:", user.id);
    } else if (!isLoading) {
      console.log("Account page - No user found");
    }
  }, [user, isLoading]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error.message);
        return;
      }
      
      if (data) {
        setAvatarUrl(data.avatar_url);
        if (data.username) setName(data.username);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast(t("Error signing out"), {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: email,
        data: { name: name }
      });

      if (updateError) throw updateError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      toast(t("Profile updated"), {
        description: t("Your profile has been successfully updated."),
      });
    } catch (error: any) {
      toast(t("Error"), {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast(t("Profile picture updated"), {
        description: t("Your profile picture has been updated successfully."),
      });
    } catch (error: any) {
      toast(t("Error"), {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || "", {
        redirectTo: `${window.location.origin}/account`,
      });
      if (error) throw error;
      
      toast(t("Password reset email sent"), {
        description: t("Check your email for the password reset link."),
      });
    } catch (error: any) {
      toast(t("Error"), {
        description: error.message,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t("Are you sure you want to delete your account? This action cannot be undone."))) {
      try {
        // This would typically call a secure server endpoint
        toast(t("Feature not available"), {
          description: t("Account deletion requires server-side implementation for security."),
        });
      } catch (error: any) {
        toast(t("Error"), {
          description: error.message,
        });
      }
    }
  };

  // If still loading
  if (isLoading) {
    return (
      <div className="min-h-screen pt-4 pb-20 px-4 max-w-md mx-auto flex flex-col space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t("account")}</h1>
          <div className="w-8" />
        </div>
        
        <div className="flex justify-center mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // If no user is found after loading completes
  if (!isLoggedIn && !isLoading) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <p className="mb-4">You need to be logged in to view this page.</p>
        <Button onClick={() => navigate('/auth')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t("account")}</h1>
          <div className="w-8" />
        </div>

        <form onSubmit={updateProfile} className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatar-upload"
                onChange={handleFileChange}
                disabled={loading}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <User className="h-4 w-4 text-white" />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t("Name")}
              </label>
              <Input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                {t("Email")}
              </label>
              <Input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              <Save className="mr-2 h-5 w-5" />
              {t("Save Changes")}
            </Button>
          </div>
        </form>

        <div className="space-y-4 pt-6">
          <Button 
            variant="outline" 
            className="w-full justify-start text-lg"
            onClick={handlePasswordReset}
            disabled={loading}
          >
            <Lock className="mr-2 h-5 w-5" />
            {t("Change Password")}
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start text-lg"
            onClick={signOut}
            disabled={loading}
          >
            <LogOut className="mr-2 h-5 w-5" />
            {t("Log Out")}
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start text-lg"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            {t("Delete Account")}
          </Button>
        </div>

        {/* Debug information */}
        <div className="mt-6 p-3 border border-dashed rounded-md">
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Debug Information</summary>
            <div className="pt-2 space-y-1">
              <p>User ID: {user?.id || "None"}</p>
              <p>Email: {user?.email || "None"}</p>
              <p>Auth Loading: {isLoading ? "Yes" : "No"}</p>
              <p>Page Loading: {loading ? "Yes" : "No"}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Account;
