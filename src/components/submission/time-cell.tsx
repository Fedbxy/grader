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

  const { time } = data;

  if (isRunning) {
    return <Skeleton className="h-8" />;
  }

  const maxTime = Math.max(...time);
  const isExceeded = maxTime >= timeLimit;

  return (
    <span className={isExceeded ? "text-destructive" : ""}>{maxTime} ms</span>
  );
}
