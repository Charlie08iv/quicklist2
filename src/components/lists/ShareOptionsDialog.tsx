
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareList } from "@/services/listService";
import { Loader2, Copy, Check, Share2 } from "lucide-react";
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
  const [canUseWebShare, setCanUseWebShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API is available
    setCanUseWebShare(!!navigator.share);
    
    if (open && !shareLink && !isSubmitting) {
      handleShare();
    }
  }, [open, shareLink, isSubmitting]);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent state updates if we're closing the dialog
    if (newOpen === open) return;
    
    // Set local state immediately
    setOpen(newOpen);
    
    // Only notify parent when closing, with a delay
    if (!newOpen && onOpenChange) {
      // Use a longer timeout to ensure state updates are processed
      setTimeout(() => {
        onOpenChange(false);
      }, 50);
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
        
        // If Web Share API is available and we're on mobile, trigger it automatically
        if (canUseWebShare && window.innerWidth < 768) {
          handleNativeShare();
        }
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
  
  const handleNativeShare = async () => {
    if (!shareLink) return;
    
    const title = "Check out this shopping list";
    const text = "I wanted to share this shopping list with you";
    
    try {
      await navigator.share({
        title,
        text,
        url: shareLink
      });
      
      // Close dialog after successful share on mobile
      handleOpenChange(false);
      
    } catch (error) {
      // User cancelled or share failed
      console.error("Sharing failed:", error);
      // Only show error if it's not a user cancellation
      if (error.name !== 'AbortError') {
        toast({
          title: "Sharing failed",
          description: "Could not open sharing options.",
          variant: "destructive"
        });
      }
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]" 
        onClick={e => {
          // Prevent clicks from bubbling up to parent elements
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onPointerDownOutside={(e) => {
          // Prevent closing on outside clicks if submitting
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-primary">{t("Share List")}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {t("Share this list with friends and family")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
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
                <Share2 className="h-4 w-4" />
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
              
              <div className="flex flex-col space-y-3 items-center justify-center pt-2">
                {canUseWebShare ? (
                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleNativeShare}
                  >
                    <Share2 className="h-5 w-5" />
                    {t("Share")}
                  </Button>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    {t("Copy the link and share it with others")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOptionsDialog;
