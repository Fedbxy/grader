"use client";

import { useState } from "react";
import { rejudgeAllSubmission } from "@/actions/admin/judge";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ConfirmButton({ id }: { id: number }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

    const result = await rejudgeAllSubmission(id);
    if (result?.error) {
      setSubmitting(false);
      return toast.error(result.error);
    }

    return toast.success(`Requested rejudging all submissions for problem #${id}.`);
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
