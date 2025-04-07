
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareList } from "@/services/listService";
import { Loader2, Copy, Check, Share } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

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
    if (!listId) return;
    
    setIsSubmitting(true);
    
    try {
      const link = await shareList(listId);
      setShareLink(link);
    } catch (error) {
      console.error("Failed to share list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("shareList")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {!shareLink ? (
            <Button 
              onClick={handleShare} 
              className="w-full" 
              disabled={isSubmitting || !listId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {t("generatingLink")}
                </>
              ) : (
                t("generateShareLink")
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="share-link">{t("shareLink")}</Label>
              <div className="flex space-x-2">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" onClick={copyToClipboard}>
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOptionsDialog;
