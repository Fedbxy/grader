"use client";

import { useState } from "react";
import { rejudgeAllSubmission } from "@/actions/admin/judge";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ConfirmButton({ id }: { id: number }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

    await rejudgeAllSubmission(id);

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
