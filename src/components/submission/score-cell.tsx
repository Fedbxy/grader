"use client";

import { useSubmission } from "@/hooks/submission";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function ScoreCell({
  submissionId,
  problemScore,
  testcases,
}: {
  submissionId: number;
  problemScore: number;
  testcases: number;
}) {
  const { data, isLoading, isRunning } = useSubmission(submissionId);

  if (isLoading) {
    return <Skeleton className="h-8" />;
  }

  const { score, result, status } = data;
  const { weights } = result;
  const weight = weights?.reduce((a: number, b: number) => a + b, 0) || testcases;

  if (isRunning) {
    return (
      <span className="flex items-center text-nowrap">
        {status}
      </span>
    );
  }

  return (
    <div className="flex flex-col">
      <span
        className={
          score === weight
            ? "text-constructive"
            : score === 0
              ? "text-destructive"
              : "text-warning"
        }
      >
        {(score * problemScore) / weight} / {problemScore}
      </span>
      <Progress
        className="h-2 w-16 md:w-32"
        variant={
          score === weight
            ? "constructive"
            : score === 0
              ? "destructive"
              : "warning"
        }
        value={(score * 100) / weight}
      />
    </div>
  );
}
