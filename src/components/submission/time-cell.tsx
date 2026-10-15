"use client";

import { useSubmission } from "@/hooks/submission";

import { Skeleton } from "@/components/ui/skeleton";

export function TimeCell({
  submissionId,
  timeLimit,
}: {
  submissionId: number;
  timeLimit: number;
}) {
  const { data, isLoading, isRunning } = useSubmission(submissionId);

  if (isLoading) {
    return <Skeleton className="h-8" />;
  }

  // Nothing measured yet; the verdict shows the live status.
  if (isRunning) {
    return <span className="text-muted-foreground">—</span>;
  }

  let maxTime = 0;
  const { result } = data;
  if (result?.times) {
    const times = result.times.flat();
    maxTime = Math.max(...times);
  }

  const isExceeded = maxTime >= timeLimit;

  return (
    <span className={isExceeded ? "text-destructive" : ""}>{maxTime} ms</span>
  );
}
