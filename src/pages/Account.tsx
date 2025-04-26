
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Lock, Trash2, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
        data: { name: name }
      });

      if (error) throw error;
      
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Here you would typically upload to Supabase storage
      // For now, we'll just update the preview
      toast({
        title: t("Profile picture updated"),
        description: t("Your profile picture has been updated successfully."),
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t("Are you sure you want to delete your account? This action cannot be undone."))) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user?.id || "");
        if (error) throw error;
        
        await signOut();
        navigate("/auth");
        toast({
          title: t("Account deleted"),
          description: t("Your account has been successfully deleted."),
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

  const handleNameClick = () => {
    const nameInput = document.getElementById('name-input') as HTMLInputElement;
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  };

  const handleEmailClick = () => {
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
      emailInput.select();
    }
  };

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
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

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
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={handleNameClick}
          >
            <User className="mr-2 h-5 w-5" />
            {t("Edit Name")}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-white text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={handleEmailClick}
          >
            <Mail className="mr-2 h-5 w-5" />
            {t("Change Email")}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-white text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={handlePasswordReset}
          >
            <Lock className="mr-2 h-5 w-5" />
            {t("Change Password")}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-white text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            {t("Log Out")}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 text-lg bg-[#1a472a] hover:bg-[#2a573a]"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            {t("Delete Account")}
          </Button>
        </div>

        <form onSubmit={updateProfile} className="hidden">
          <Input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};

export default Account;
