
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareList } from "@/services/listService";
import { Loader2, Copy, Check, Share, Facebook, Twitter, Mail, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

interface ShareOptionsDialogProps {
  listId: string;
  onOpenChange?: (open: boolean) => void;
}

const ShareOptionsDialog: React.FC<ShareOptionsDialogProps> = ({ listId, onOpenChange }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (open) {
      handleShare();
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleShare = async () => {
    if (!listId) {
      toast({
        title: "No list selected",
        description: "Please select a list to share.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const link = await shareList(listId);
      if (link) {
        setShareLink(link);
        toast({
          title: "Link generated",
          description: "Share link has been created successfully."
        });
      }
    } catch (error) {
      console.error("Failed to share list:", error);
      toast({
        title: "Error",
        description: "Failed to generate share link.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard."
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleShareVia = (platform: string) => {
    if (!shareLink) return;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('Check out this shopping list')}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Check out this shopping list')}&body=${encodeURIComponent(`I wanted to share this shopping list with you: ${shareLink}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">{t("Share List")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {isSubmitting ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !shareLink ? (
            <div className="py-8 text-center text-muted-foreground">
              Failed to generate share link. Please try again.
              <Button 
                onClick={handleShare} 
                className="w-full mt-4 flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                {t("Try Again")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="share-link" className="text-primary">{t("Share Link")}</Label>
                <div className="flex space-x-2">
                  <Input
                    id="share-link"
                    value={shareLink}
                    readOnly
                    className="flex-1 border-primary/20"
                  />
                  <Button 
                    size="icon" 
                    onClick={copyToClipboard}
                    variant={isCopied ? "default" : "outline"}
                    className={isCopied ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-primary">{t("Share via")}</Label>
                <div className="flex justify-center space-x-3 pt-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => handleShareVia('facebook')}
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => handleShareVia('twitter')}
                  >
                    <Twitter className="h-5 w-5 text-blue-400" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => handleShareVia('email')}
                  >
                    <Mail className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={copyToClipboard}
                  >
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOptionsDialog;
