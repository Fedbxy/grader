"use client";

import React from "react";
import { useSubmission } from "@/hooks/submission";
import { cn } from "@/lib/shadcn";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function ActionsButton({
  submissionId,
  testcases,
}: {
  submissionId: number;
  testcases: number;
}) {
  const { data, isLoading, isRunning } = useSubmission(submissionId);

  if (isLoading) {
    return <Skeleton className="h-8 w-8" />;
  }

  const { score } = data;
  const isAccepted = score === testcases;

  return (
    <Button
      variant="outline"
      className={cn(
        "h-8 w-8 p-0",
        isRunning ? "" : isAccepted ? "bg-constructive/15 text-constructive" : "bg-destructive/15 text-destructive",
      )}
    >
      {isRunning ? (
        <LoadingSpinner className="h-4 w-4" />
      ) : isAccepted ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span className="sr-only">Open menu</span>
    </Button>
  );
}
