
import React, { useState, useEffect } from "react";
import { shareList } from "@/services/listService";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

interface ShareOptionsProps {
  listId: string;
  onComplete?: () => void;
}

// This component no longer renders a dialog UI
// Instead, it triggers the native share sheet directly
const ShareOptions: React.FC<ShareOptionsProps> = ({ listId, onComplete }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Trigger share automatically when component mounts
    handleShare();
  }, []);

  const handleShare = async () => {
    if (!listId) {
      toast({
        title: "No list selected",
        description: "Please select a list to share.",
        variant: "destructive"
      });
      if (onComplete) onComplete();
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const shareLink = await shareList(listId);
      if (!shareLink) {
        throw new Error("Failed to generate share link");
      }
      
      const title = t("Check out this shopping list");
      const text = t("I wanted to share this shopping list with you");
      
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url: shareLink
          });
          toast({
            title: t("Shared!"),
            description: t("List has been shared successfully")
          });
        } catch (error) {
          // Only show error if it's not a user cancellation
          if (error.name !== 'AbortError') {
            console.error("Share failed:", error);
            toast({
              title: t("Sharing failed"),
              description: t("Could not share this list"),
              variant: "destructive"
            });
          }
        }
      } else {
        // Fallback if Web Share API is not available
        // Copy to clipboard instead
        await navigator.clipboard.writeText(shareLink);
        toast({
          title: t("Link copied!"),
          description: t("Share link copied to clipboard.")
        });
      }
    } catch (error) {
      console.error("Failed to share list:", error);
      toast({
        title: t("Error"),
        description: t("Failed to generate share link."),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      if (onComplete) onComplete();
    }
  };

  return isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null;
};

export default ShareOptions;
