
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/hooks/use-translation";

const FeedbackForm: React.FC = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFeedback("");
      toast({
        title: t("feedback") + " " + t("success").toLowerCase(),
        description: t("thankYou"),
      });
    }, 1000); // simulate network
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
        {sending ? t("Sending...") : t("sendFeedback")}
      </Button>
    </form>
  );
};

export default FeedbackForm;
