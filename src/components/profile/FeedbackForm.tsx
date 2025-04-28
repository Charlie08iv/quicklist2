
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; 
import { useTranslation } from "@/hooks/use-translation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const FeedbackForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast(); // Using the proper useToast hook
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast({
        title: t("error"),
        description: t("Feedback cannot be empty"),
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: t("error"),
        description: t("pleaseLoginFirst"),
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          content: feedback,
          user_id: user.id
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setFeedback("");
      toast({
        title: t("Success"),
        description: t("Thank you for your feedback!"),
      });
      console.log("Feedback submitted successfully");
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: t("Error"),
        description: t("Couldn't send your feedback. Please try again."),
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder={t("Tell us what you think...")}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        required
        disabled={sending}
        maxLength={500}
        className="resize-none text-sm"
      />
      <Button type="submit" disabled={sending || feedback.trim().length === 0} size="sm">
        {sending ? t("Sending...") : t("Send Feedback")}
      </Button>
    </form>
  );
};

export default FeedbackForm;
