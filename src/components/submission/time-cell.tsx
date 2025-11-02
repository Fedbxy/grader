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

  if (isLoading || isRunning) {
    return <Skeleton className="h-8" />;
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
