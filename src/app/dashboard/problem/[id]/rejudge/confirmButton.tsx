"use client";

import { useState } from "react";
import { messages } from "@/config/messages";
import { rejudgeAllSubmission } from "@/actions/admin/judge";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function ConfirmButton({ id }: { id: number }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  function handleClick() {
    setSubmitting(true);

    rejudgeAllSubmission(id);

    return toast({
      variant: "constructive",
      title: messages.toast.success,
      description: `Requested rejudging all submissions for problem #${id}.`,
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
