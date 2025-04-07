
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareList } from "@/services/listService";
import { Loader2, Copy, Check, Share } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "@/components/ui/use-toast";

interface ShareOptionsDialogProps {
  listId?: string;
}

const ShareOptionsDialog: React.FC<ShareOptionsDialogProps> = ({ listId }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
          disabled={!listId}
          title={t("shareList")}
        >
          <Share className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">{t("shareList")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {!shareLink ? (
            <Button 
              onClick={handleShare} 
              className="w-full flex items-center gap-2"
              disabled={isSubmitting || !listId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  {t("generatingLink")}
                </>
              ) : (
                <>
                  <Share className="h-4 w-4" />
                  {t("generateShareLink")}
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="share-link" className="text-primary">{t("shareLink")}</Label>
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
              <p className="text-sm text-muted-foreground mt-2">
                Share this link with others to collaborate on this shopping list.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOptionsDialog;
