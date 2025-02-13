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

  const { memory } = data;

  if (isRunning) {
    return <Skeleton className="h-8" />;
  }

  const maxMemory = Math.max(...memory);
  const isExceeded = maxMemory >= memoryLimit * 1024;

  return (
    <span className={isExceeded ? "text-destructive" : ""}>{maxMemory} KB</span>
  );
}
