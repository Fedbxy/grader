"use client";

import { useSubmission } from "@/hooks/submission";
import { cn } from "@/lib/shadcn";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function Score({
  submissionId,
  problemScore,
  testcases,
}: {
  submissionId: number;
  problemScore: number;
  testcases: number;
}) {
  const { data, isLoading } = useSubmission(submissionId);

  if (isLoading) {
    return <Skeleton className="h-9" />;
  }

  const { score } = data;

  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "text-xs",
          score === testcases
            ? "text-constructive"
            : score === 0
              ? "text-destructive"
              : "text-warning",
        )}
      >
        {(score * problemScore) / testcases} / {problemScore}
      </span>
      <Progress
        className="h-2 w-32"
        variant={
          score === testcases
            ? "constructive"
            : score === 0
              ? "destructive"
              : "warning"
        }
        value={(score * 100) / testcases}
      />
    </div>
  );
}
