
import React, { useState } from "react";
import { shareList } from "@/services/listService";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

interface ShareOptionsProps {
  listId: string;
  onComplete?: () => void;
}

// This component triggers the native share sheet
const ShareOptions: React.FC<ShareOptionsProps> = ({ listId, onComplete }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  // Immediately trigger share when component mounts
  React.useEffect(() => {
    handleShare();
  }, []);

  const handleShare = async () => {
    if (!listId) {
      toast({
        title: t("No list selected"),
        description: t("Please select a list to share."),
        variant: "destructive"
      });
      if (onComplete) onComplete();
      return;
    }
    
    try {
      const shareLink = await shareList(listId);
      if (!shareLink) {
        throw new Error("Failed to generate share link");
      }
      
      const title = t("Check out this shopping list");
      const text = t("I wanted to share this shopping list with you");

      // Check if the Web Share API is available (iOS, Android, newer browsers)
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
        } catch (error: any) {
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
        // Fallback for browsers that don't support Web Share API
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

  // Return a loader while processing, but it will be very brief
  return isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null;
};

export default ShareOptions;
