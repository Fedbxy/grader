"use client";

import { useState } from "react";
import { rejudgeAllSubmission } from "@/actions/admin/judge";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ConfirmButton({
  problemId,
  submissionIds,
}: {
  problemId: number;
  submissionIds: number[];
}) {
  const { mutate } = useSWRConfig();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

    const result = await rejudgeAllSubmission(problemId);
    if (result?.error) {
      setSubmitting(false);
      return toast.error(result.error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    submissionIds.forEach((id) => mutate(`/api/submission/${id}`));

    return toast.success(`Requested rejudging all submissions for problem #${problemId}.`);
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
