"use client";

import React from "react";
import { useSubmission } from "@/hooks/submission";
import { cn } from "@/lib/shadcn";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

// Extra props are passed through so a menu trigger can render as this button
// (`asChild`) instead of wrapping it in a second <button>.
export function ActionsButton({
  submissionId,
  testcases,
  className,
  ...props
}: {
  submissionId: number;
  testcases: number;
} & React.ComponentProps<typeof Button>) {
  const { data, isLoading, isRunning } = useSubmission(submissionId);

  if (isLoading) {
    return <Skeleton className="h-8 w-8" {...(props as React.ComponentProps<"div">)} />;
  }

  const { score } = data;
  const isAccepted = score === testcases;

  return (
    <Button
      variant="outline"
      className={cn(
        "h-8 w-8 p-0",
        isRunning ? "" : isAccepted ? "bg-constructive/15 text-constructive" : "bg-destructive/15 text-destructive",
        className,
      )}
      {...props}
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
