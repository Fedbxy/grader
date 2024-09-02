"use client";

import { useState } from "react";
import { messages } from "@/config/messages";
import { rejudgeAllSubmission } from "@/actions/admin/judge";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function ConfirmButton({ id }: { id: number }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

    await rejudgeAllSubmission(id);

    return toast({
      variant: "constructive",
      title: messages.toast.success,
      description: "Your rejudging request has been submitted.",
    });
  }

  return (
    <Button
      variant="destructive"
      disabled={submitting}
      onClick={() => handleClick()}
    >
      {submitting ? "Rejudging..." : "Rejudge"}
    </Button>
  );
}
