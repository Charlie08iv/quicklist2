
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Lock, Trash2, ArrowLeft, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";

const Account = () => {
  const { user, session } = useAuth();
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
    } else {
      console.log("Account page - No user found");
    }
  }, [user]);

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
      toast({
        title: t("Error signing out"),
        description: error.message,
        variant: "destructive",
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
      
      toast({
        title: t("Profile updated"),
        description: t("Your profile has been successfully updated."),
      });
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
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
      toast({
        title: t("Profile picture updated"),
        description: t("Your profile picture has been updated successfully."),
      });
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
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
      
      toast({
        title: t("Password reset email sent"),
        description: t("Check your email for the password reset link."),
      });
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t("Are you sure you want to delete your account? This action cannot be undone."))) {
      try {
        // This would typically call a secure server endpoint
        // Direct admin API calls are not secure from the client
        toast({
          title: t("Feature not available"),
          description: t("Account deletion requires server-side implementation for security."),
          variant: "destructive",
        });
      } catch (error: any) {
        toast({
          title: t("Error"),
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // If no user is found at all (after loading completes)
  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">You need to be logged in to view this page.</p>
        <Button onClick={() => navigate('/auth')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-[#092211]">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-[#1a472a]"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t("account")}</h1>
          <div className="w-8" />
        </div>

        <form onSubmit={updateProfile} className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-[#1a472a] bg-[#1a472a]">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  <User className="h-12 w-12 text-white/60" />
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
                className="absolute bottom-0 right-0 p-1.5 bg-[#1a472a] rounded-full cursor-pointer hover:bg-[#2a573a] transition-colors"
              >
                <User className="h-4 w-4 text-white" />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-1 block">
                {t("Name")}
              </label>
              <Input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1a472a] border-[#2a573a] text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-1 block">
                {t("Email")}
              </label>
              <Input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1a472a] border-[#2a573a] text-white"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1a472a] hover:bg-[#2a573a] text-white"
              disabled={loading}
            >
              <Save className="mr-2 h-5 w-5" />
              {t("Save Changes")}
            </Button>
          </div>
        </form>

        <div className="space-y-4 pt-6">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={handlePasswordReset}
            disabled={loading}
          >
            <Lock className="mr-2 h-5 w-5" />
            {t("Change Password")}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-white text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={signOut}
            disabled={loading}
          >
            <LogOut className="mr-2 h-5 w-5" />
            {t("Log Out")}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            {t("Delete Account")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;
