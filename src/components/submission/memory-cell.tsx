"use client";

import { useSubmission } from "@/hooks/submission";

import { Skeleton } from "@/components/ui/skeleton";

export function MemoryCell({
  submissionId,
  memoryLimit,
}: {
  submissionId: number;
  memoryLimit: number;
}) {
  const { data, isLoading, isRunning } = useSubmission(submissionId);

  if (isLoading) {
    return <Skeleton className="h-8" />;
  }

  // Nothing measured yet; the verdict shows the live status.
  if (isRunning) {
    return <span className="text-muted-foreground">—</span>;
  }

  let maxMemory = 0;
  const { result } = data;
  if (result?.memories) {
    const memory = result.memories.flat();
    maxMemory = Math.max(...memory);
  }

  const isExceeded = maxMemory >= memoryLimit * 1024;

  return (
    <span className={isExceeded ? "text-destructive" : ""}>{maxMemory} KB</span>
  );
}
