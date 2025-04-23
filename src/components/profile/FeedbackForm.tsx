
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const FeedbackForm: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFeedback("");
      toast({
        title: "Feedback sent",
        description: "Thank you for your feedback!",
      });
    }, 1000); // simulate network
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Tell us what you think..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        required
        disabled={sending}
        maxLength={500}
        className="resize-none text-sm"
      />
      <Button type="submit" disabled={sending || feedback.trim().length === 0} size="sm">
        {sending ? "Sending..." : "Send Feedback"}
      </Button>
    </form>
  );
};

export default FeedbackForm;
