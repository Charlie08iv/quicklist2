
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { Copy, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShareOptionsDialogProps {
  listId: string;
  listName?: string;
  onClose?: () => void;
}

const ShareOptionsDialog: React.FC<ShareOptionsDialogProps> = ({ 
  listId, 
  listName = "Shopping List",
  onClose 
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("link");

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const shareUrl = `https://quicklist.app/share/${listId}`;
  
  const shareText = `${t("Check out my shopping list")}: ${listName}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("Copied to clipboard"));
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, "_blank");
  };

  const shareViaMessages = () => {
    const url = `sms:?&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, "_blank");
  };

  const inviteByEmail = () => {
    if (email) {
      // In a real app, this would send an invite email
      toast.success(`${t("Invitation sent to")} ${email}`);
      setEmail("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Share Shopping List")}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">{t("Link")}</TabsTrigger>
            <TabsTrigger value="apps">{t("Apps")}</TabsTrigger>
            <TabsTrigger value="contacts">{t("Contacts")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  {t("Share Link")}
                </Label>
                <Input
                  id="link"
                  readOnly
                  value={shareUrl}
                />
              </div>
              <Button 
                size="sm" 
                className="px-3" 
                onClick={() => copyToClipboard(shareUrl)}
              >
                <span className="sr-only">{t("Copy")}</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="text" className="sr-only">
                  {t("Share Text")}
                </Label>
                <Input
                  id="text"
                  readOnly
                  value={shareText}
                />
              </div>
              <Button 
                size="sm" 
                className="px-3" 
                onClick={() => copyToClipboard(shareText)}
              >
                <span className="sr-only">{t("Copy")}</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="apps" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col justify-center items-center"
                onClick={shareViaMessages}
              >
                <MessageSquare className="h-8 w-8 mb-1" />
                <span>{t("Messages")}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col justify-center items-center"
                onClick={shareViaWhatsApp}
              >
                {/* Simple WhatsApp style icon */}
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center mb-1">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span>WhatsApp</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">{t("Name")}</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={t("Contact name")}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("Email")}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              
              <Button onClick={inviteByEmail} disabled={!email}>
                <Send className="mr-2 h-4 w-4" />
                {t("Invite")}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("Or")}
                  </span>
                </div>
              </div>
              
              <Button variant="outline">
                {t("Sync Contacts")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOptionsDialog;
